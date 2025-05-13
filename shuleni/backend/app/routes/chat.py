from flask import Blueprint, jsonify, request
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
    
    if chat_id.startswith('class_'):
        # Class chat
        class_id = int(chat_id.split('_')[1])
        
        # Verify user is enrolled in the class
        class_ = Class.query.get_or_404(class_id)
        if not any(student.id == current_user_id for student in class_.students):
            return jsonify({'error': 'Not enrolled in this class'}), 403
            
        messages = Chat.query.filter(
            Chat.class_id == class_id,
            Chat.chat_type == 'class'
        ).order_by(Chat.timestamp.asc()).all()
    else:
        # Direct chat
        other_user_id = int(chat_id)
        messages = Chat.query.filter(
            ((Chat.sender_id == current_user_id) & (Chat.recipient_id == other_user_id)) |
            ((Chat.sender_id == other_user_id) & (Chat.recipient_id == current_user_id)),
            Chat.chat_type == 'direct'
        ).order_by(Chat.timestamp.asc()).all()
    
    # Mark received messages as read
    unread_messages = [msg for msg in messages if msg.recipient_id == current_user_id and not msg.is_read]
    for msg in unread_messages:
        msg.is_read = True
        msg.has_notification = False
    if unread_messages:
        db.session.commit()
    
    return jsonify([msg.to_dict() for msg in messages])

# Get user's chat list (users they've chatted with and their class chats)
@bp.route('/contacts', methods=['GET'])
@jwt_required()
@has_permission('participate_chat')
def get_chat_contacts():
    current_user_id = get_jwt_identity()
    
    # Get direct chat contacts
    sent_to = db.session.query(Chat.recipient_id).filter(
        Chat.sender_id == current_user_id,
        Chat.chat_type == 'direct'
    ).distinct()
    received_from = db.session.query(Chat.sender_id).filter(
        Chat.recipient_id == current_user_id,
        Chat.chat_type == 'direct'
    ).distinct()
    contact_ids = sent_to.union(received_from).all()
    
    contacts = []
    
    # Add direct chat contacts
    for (user_id,) in contact_ids:
        user = User.query.get(user_id)
        if user:
            # Get unread message count for this contact
            unread_count = Chat.query.filter(
                Chat.sender_id == user_id,
                Chat.recipient_id == current_user_id,
                Chat.is_read == False,
                Chat.chat_type == 'direct'
            ).count()
            
            # Get last message
            last_message = Chat.query.filter(
                ((Chat.sender_id == current_user_id) & (Chat.recipient_id == user_id)) |
                ((Chat.sender_id == user_id) & (Chat.recipient_id == current_user_id)),
                Chat.chat_type == 'direct'
            ).order_by(Chat.timestamp.desc()).first()
            
            contacts.append({
                'id': str(user.id),  # Direct chat ID is just the user ID
                'type': 'direct',
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'role': user.role,
                'unread_count': unread_count,
                'last_message': last_message.to_dict() if last_message else None
            })
    
    # Add class chats
    current_user = User.query.get(current_user_id)
    for class_ in current_user.enrolled_classes:
        # Get unread message count for this class
        unread_count = Chat.query.filter(
            Chat.class_id == class_.id,
            Chat.sender_id != current_user_id,
            Chat.chat_type == 'class',
            Chat.has_notification == True
        ).count()
        
        # Get last message
        last_message = Chat.query.filter(
            Chat.class_id == class_.id,
            Chat.chat_type == 'class'
        ).order_by(Chat.timestamp.desc()).first()
        
        contacts.append({
            'id': f"class_{class_.id}",  # Class chat ID is "class_" + class ID
            'type': 'class',
            'name': class_.name,
            'unread_count': unread_count,
            'last_message': last_message.to_dict() if last_message else None,
            'member_count': len(class_.students)
        })
    
    return jsonify(contacts)

# Get unread notifications count
@bp.route('/notifications/count', methods=['GET'])
@jwt_required()
@has_permission('participate_chat')
def get_notification_count():
    current_user_id = get_jwt_identity()
    
    # Count unread direct messages
    direct_count = Chat.query.filter(
        Chat.recipient_id == current_user_id,
        Chat.has_notification == True,
        Chat.chat_type == 'direct'
    ).count()
    
    # Count unread class messages
    user = User.query.get(current_user_id)
    class_ids = [c.id for c in user.enrolled_classes]
    class_count = Chat.query.filter(
        Chat.class_id.in_(class_ids),
        Chat.sender_id != current_user_id,
        Chat.has_notification == True,
        Chat.chat_type == 'class'
    ).count()
    
    return jsonify({'count': direct_count + class_count})

# Mark notifications as read
@bp.route('/notifications/read', methods=['POST'])
@jwt_required()
@has_permission('participate_chat')
def mark_notifications_read():
    current_user_id = get_jwt_identity()
    
    # Mark direct messages as read
    Chat.query.filter(
        Chat.recipient_id == current_user_id,
        Chat.has_notification == True,
        Chat.chat_type == 'direct'
    ).update({'has_notification': False})
    
    # Mark class messages as read
    user = User.query.get(current_user_id)
    class_ids = [c.id for c in user.enrolled_classes]
    Chat.query.filter(
        Chat.class_id.in_(class_ids),
        Chat.sender_id != current_user_id,
        Chat.has_notification == True,
        Chat.chat_type == 'class'
    ).update({'has_notification': False})
    
    db.session.commit()
    return jsonify({'status': 'success'})

# Socket.IO event handlers
@socketio.on('connect')
@jwt_required()
def handle_connect():
    current_user_id = get_jwt_identity()
    
    # Join user's direct chat room
    join_room(str(current_user_id))
    
    # Join class chat rooms
    user = User.query.get(current_user_id)
    for class_ in user.enrolled_classes:
        join_room(f"class_{class_.id}")
    
    socketio.emit('user_connected', {'user_id': current_user_id})

@socketio.on('disconnect')
def handle_disconnect():
    pass

@socketio.on('send_message')
@jwt_required()
def handle_message(data):
    current_user_id = get_jwt_identity()
    chat_id = data.get('chat_id')
    message_text = data.get('message')
    
    if not chat_id or not message_text:
        return
    
    if chat_id.startswith('class_'):
        # Class chat message
        class_id = int(chat_id.split('_')[1])
        
        # Verify user is enrolled in the class
        class_ = Class.query.get(class_id)
        if not any(student.id == current_user_id for student in class_.students):
            return
        
        new_message = Chat(
            sender_id=current_user_id,
            class_id=class_id,
            message=message_text,
            chat_type='class',
            has_notification=True
        )
    else:
        # Direct chat message
        recipient_id = int(chat_id)
        new_message = Chat(
            sender_id=current_user_id,
            recipient_id=recipient_id,
            message=message_text,
            chat_type='direct',
            has_notification=True
        )
    
    db.session.add(new_message)
    db.session.commit()
    
    # Emit message to appropriate room(s)
    message_dict = new_message.to_dict()
    if new_message.chat_type == 'class':
        emit('new_message', message_dict, room=f"class_{new_message.class_id}")
    else:
        emit('new_message', message_dict, room=str(current_user_id))
        emit('new_message', message_dict, room=str(new_message.recipient_id))
    
    return jsonify(message_dict) 