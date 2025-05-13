from datetime import datetime
from .. import db

class Chat(db.Model):
    __tablename__ = 'chats'
    
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable for class chats
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=True)  # For class-based chats
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    has_notification = db.Column(db.Boolean, default=True)
    chat_type = db.Column(db.String(20), default='direct')  # 'direct' or 'class'
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')
    class_ = db.relationship('Class', backref='chat_messages')
    
    def to_dict(self):
        base_dict = {
            'id': self.id,
            'message': self.message,
            'sender_id': self.sender_id,
            'timestamp': self.timestamp.isoformat(),
            'is_read': self.is_read,
            'has_notification': self.has_notification,
            'chat_type': self.chat_type,
            'sender': {
                'id': self.sender.id,
                'email': self.sender.email,
                'first_name': self.sender.first_name,
                'last_name': self.sender.last_name,
                'role': self.sender.role
            }
        }
        
        if self.chat_type == 'direct':
            base_dict.update({
                'recipient_id': self.recipient_id,
                'recipient': {
                    'id': self.recipient.id,
                    'email': self.recipient.email,
                    'first_name': self.recipient.first_name,
                    'last_name': self.recipient.last_name,
                    'role': self.recipient.role
                }
            })
        else:  # class chat
            base_dict.update({
                'class_id': self.class_id,
                'class': {
                    'id': self.class_.id,
                    'name': self.class_.name
                }
            })
            
        return base_dict 