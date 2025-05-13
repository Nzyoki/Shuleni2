from datetime import datetime
from .. import db

class Chat(db.Model):
    __tablename__ = 'chats'
    
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    has_notification = db.Column(db.Boolean, default=True)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')
    
    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'timestamp': self.timestamp.isoformat(),
            'is_read': self.is_read,
            'has_notification': self.has_notification,
            'sender': {
                'id': self.sender.id,
                'email': self.sender.email,
                'first_name': self.sender.first_name,
                'last_name': self.sender.last_name
            },
            'recipient': {
                'id': self.recipient.id,
                'email': self.recipient.email,
                'first_name': self.recipient.first_name,
                'last_name': self.recipient.last_name
            }
        } 