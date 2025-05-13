from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import emit, join_room, leave_room
from .. import db, socketio
from ..models.chat import Chat
from ..models.user import User
from ..utils.decorators import has_permission
from sqlalchemy import func

bp = Blueprint('chat', __name__, url_prefix='/api/chat')

# Get chat messages between two users
@bp.route('/messages/<int:other_user_id>', methods=['GET'])
@jwt_required()
@has_permission('participate_chat')
def get_messages(other_user_id):
    current_user_id = get_jwt_identity()
    
    # Get messages where current user is either sender or recipient
    messages = Chat.query.filter(
        ((Chat.sender_id == current_user_id) & (Chat.recipient_id == other_user_id)) |
        ((Chat.sender_id == other_user_id) & (Chat.recipient_id == current_user_id))
    ).order_by(Chat.timestamp.asc()).all()
    
    # Mark received messages as read
    unread_messages = [msg for msg in messages if msg.recipient_id == current_user_id and not msg.is_read]
    for msg in unread_messages:
        msg.is_read = True
        msg.has_notification = False
    if unread_messages:
        db.session.commit()
    
    return jsonify([msg.to_dict() for msg in messages])

# Get user's chat list (users they've chatted with)
@bp.route('/contacts', methods=['GET'])
@jwt_required()
@has_permission('participate_chat')
def get_chat_contacts():
    current_user_id = get_jwt_identity()
    
    # Get unique users that the current user has chatted with
    sent_to = db.session.query(Chat.recipient_id).filter(Chat.sender_id == current_user_id).distinct()
    received_from = db.session.query(Chat.sender_id).filter(Chat.recipient_id == current_user_id).distinct()
    contact_ids = sent_to.union(received_from).all()
    
    contacts = []
    for (user_id,) in contact_ids:
        user = User.query.get(user_id)
        if user:
            # Get unread message count for this contact
            unread_count = Chat.query.filter(
                Chat.sender_id == user_id,
                Chat.recipient_id == current_user_id,
                Chat.is_read == False
            ).count()
            
            # Get last message
            last_message = Chat.query.filter(
                ((Chat.sender_id == current_user_id) & (Chat.recipient_id == user_id)) |
                ((Chat.sender_id == user_id) & (Chat.recipient_id == current_user_id))
            ).order_by(Chat.timestamp.desc()).first()
            
            contacts.append({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'unread_count': unread_count,
                'last_message': last_message.to_dict() if last_message else None
            })
    
    return jsonify(contacts)

# Get unread notifications count
@bp.route('/notifications/count', methods=['GET'])
@jwt_required()
@has_permission('participate_chat')
def get_notification_count():
    current_user_id = get_jwt_identity()
    count = Chat.query.filter(
        Chat.recipient_id == current_user_id,
        Chat.has_notification == True
    ).count()
    return jsonify({'count': count})

# Mark notifications as read
@bp.route('/notifications/read', methods=['POST'])
@jwt_required()
@has_permission('participate_chat')
def mark_notifications_read():
    current_user_id = get_jwt_identity()
    Chat.query.filter(
        Chat.recipient_id == current_user_id,
        Chat.has_notification == True
    ).update({'has_notification': False})
    db.session.commit()
    return jsonify({'status': 'success'})

# Socket.IO event handlers
@socketio.on('connect')
@jwt_required()
def handle_connect():
    current_user_id = get_jwt_identity()
    join_room(str(current_user_id))
    socketio.emit('user_connected', {'user_id': current_user_id})

@socketio.on('disconnect')
def handle_disconnect():
    pass

@socketio.on('send_message')
@jwt_required()
def handle_message(data):
    current_user_id = get_jwt_identity()
    recipient_id = data.get('recipient_id')
    message_text = data.get('message')
    
    if not recipient_id or not message_text:
        return
    
    # Create and save new message
    new_message = Chat(
        sender_id=current_user_id,
        recipient_id=recipient_id,
        message=message_text,
        has_notification=True
    )
    db.session.add(new_message)
    db.session.commit()
    
    # Emit message to both sender and recipient
    message_dict = new_message.to_dict()
    emit('new_message', message_dict, room=str(current_user_id))
    emit('new_message', message_dict, room=str(recipient_id))
    
    # Emit notification to recipient
    notification_count = Chat.query.filter(
        Chat.recipient_id == recipient_id,
        Chat.has_notification == True
    ).count()
    emit('notification_update', {'count': notification_count}, room=str(recipient_id))
    
    return jsonify(message_dict) 