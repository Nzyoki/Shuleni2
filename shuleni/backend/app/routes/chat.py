from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import emit, join_room, leave_room
from .. import db, socketio
from ..models.chat import Chat
from ..models.user import User
from ..models.class_ import Class
from ..utils.decorators import has_permission
from sqlalchemy import func, or_

bp = Blueprint('chat', __name__, url_prefix='/api/chat')

# Get chat messages between two users or in a class
@bp.route('/messages/<string:chat_id>', methods=['GET'])
@jwt_required()
@has_permission('participate_chat')
def get_messages(chat_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if chat_id.startswith('class_'):
        class_id = int(chat_id.split('_')[1])
        class_ = Class.query.get_or_404(class_id)
        
        if current_user not in class_.students and current_user.id != class_.teacher_id:
            return jsonify({'error': 'Permission denied'}), 403
            
        messages = Chat.query.filter_by(
            class_id=class_id,
            chat_type='class'
        ).order_by(Chat.timestamp.asc()).all()
    else:
        other_user_id = int(chat_id)
        messages = Chat.query.filter(
            ((Chat.sender_id == current_user_id) & (Chat.recipient_id == other_user_id)) |
            ((Chat.sender_id == other_user_id) & (Chat.recipient_id == current_user_id))
        ).filter_by(chat_type='direct').order_by(Chat.timestamp.asc()).all()
        
        Chat.query.filter_by(
            sender_id=other_user_id,
            recipient_id=current_user_id,
            is_read=False
        ).update({'is_read': True})
        db.session.commit()
    
    return jsonify([message.to_dict() for message in messages]), 200

# Get user's chat list (users they've chatted with and their class chats)
@bp.route('/contacts', methods=['GET'])
@jwt_required()
@has_permission('participate_chat')
def get_chat_contacts():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    contacts = []
    
    direct_contacts = db.session.query(User).distinct().join(Chat, (
        (Chat.sender_id == User.id) & (Chat.recipient_id == current_user_id) |
        (Chat.sender_id == current_user_id) & (Chat.recipient_id == User.id)
    )).filter(Chat.chat_type == 'direct').all()
    
    for user in direct_contacts:
        unread_count = Chat.query.filter_by(
            sender_id=user.id,
            recipient_id=current_user_id,
            is_read=False
        ).count()
        
        last_message = Chat.query.filter(
            ((Chat.sender_id == current_user_id) & (Chat.recipient_id == user.id)) |
            ((Chat.sender_id == user.id) & (Chat.recipient_id == current_user_id))
        ).order_by(Chat.timestamp.desc()).first()
        
        contacts.append({
            'id': str(user.id),
            'name': f"{user.first_name} {user.last_name}",
            'type': 'direct',
            'unread_count': unread_count,
            'last_message': last_message.to_dict() if last_message else None
        })
    
    user_classes = current_user.classes_teaching + current_user.classes_enrolled
    for class_ in user_classes:
        unread_count = Chat.query.filter_by(
            class_id=class_.id,
            chat_type='class',
            has_notification=True
        ).count()
        
        last_message = Chat.query.filter_by(
            class_id=class_.id,
            chat_type='class'
        ).order_by(Chat.timestamp.desc()).first()
        
        contacts.append({
            'id': f"class_{class_.id}",
            'name': class_.name,
            'type': 'class',
            'member_count': len(class_.students) + 1,
            'unread_count': unread_count,
            'last_message': last_message.to_dict() if last_message else None
        })
    
    return jsonify(contacts), 200

# Get unread notifications count
@bp.route('/notifications/count', methods=['GET'])
@jwt_required()
@has_permission('participate_chat')
def get_notifications_count():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    direct_count = Chat.query.filter_by(
        recipient_id=current_user_id,
        chat_type='direct',
        is_read=False
    ).count()
    
    class_count = Chat.query.filter(
        Chat.class_id.in_([c.id for c in current_user.classes_enrolled + current_user.classes_teaching]),
        Chat.chat_type == 'class',
        Chat.has_notification == True
    ).count()
    
    return jsonify({
        'total': direct_count + class_count,
        'direct': direct_count,
        'class': class_count
    }), 200

# Mark notifications as read
@bp.route('/notifications/read', methods=['POST'])
@jwt_required()
@has_permission('participate_chat')
def mark_notifications_read():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    Chat.query.filter_by(
        recipient_id=current_user_id,
        chat_type='direct',
        is_read=False
    ).update({'is_read': True})
    
    Chat.query.filter(
        Chat.class_id.in_([c.id for c in current_user.classes_enrolled + current_user.classes_teaching]),
        Chat.chat_type == 'class',
        Chat.has_notification == True
    ).update({'has_notification': False})
    
    db.session.commit()
    return '', 204

# Socket.IO event handlers
@socketio.on('connect')
@jwt_required()
def handle_connect():
    current_user_id = get_jwt_identity()
    join_room(f"user_{current_user_id}")
    
    current_user = User.query.get(current_user_id)
    for class_ in current_user.classes_enrolled + current_user.classes_teaching:
        join_room(f"class_{class_.id}")

@socketio.on('disconnect')
def handle_disconnect():
    pass

@socketio.on('message')
@jwt_required()
def handle_message(data):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if data['type'] == 'class':
        class_id = int(data['recipient_id'].split('_')[1])
        class_ = Class.query.get_or_404(class_id)
        
        if current_user not in class_.students and current_user.id != class_.teacher_id:
            return {'error': 'Permission denied'}, 403
            
        message = Chat(
            sender_id=current_user_id,
            class_id=class_id,
            content=data['content'],
            chat_type='class',
            has_notification=True
        )
        db.session.add(message)
        db.session.commit()
        
        emit('message', message.to_dict(), room=f"class_{class_id}")
    else:
        recipient_id = int(data['recipient_id'])
        message = Chat(
            sender_id=current_user_id,
            recipient_id=recipient_id,
            content=data['content'],
            chat_type='direct'
        )
        db.session.add(message)
        db.session.commit()
        
        emit('message', message.to_dict(), room=f"user_{current_user_id}")
        emit('message', message.to_dict(), room=f"user_{recipient_id}")
        emit('notification', {'type': 'message', 'from': current_user_id}, room=f"user_{recipient_id}") 