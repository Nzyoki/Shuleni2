from datetime import datetime
from .. import db

class Chat(db.Model):
    __tablename__ = 'chats'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'))
    content = db.Column(db.Text, nullable=False)
    chat_type = db.Column(db.String(20), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    has_notification = db.Column(db.Boolean, default=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='messages_sent', lazy=True)
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='messages_received', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'class_id': self.class_id,
            'content': self.content,
            'chat_type': self.chat_type,
            'is_read': self.is_read,
            'has_notification': self.has_notification,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'sender': {
                'id': self.sender.id,
                'first_name': self.sender.first_name,
                'last_name': self.sender.last_name
            } if self.sender else None,
            'recipient': {
                'id': self.recipient.id,
                'first_name': self.recipient.first_name,
                'last_name': self.recipient.last_name
            } if self.recipient else None
        } 