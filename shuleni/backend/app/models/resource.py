from datetime import datetime
from .. import db

class Resource(db.Model):
    __tablename__ = 'resources'

    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)  # 'document', 'video', 'link', etc.
    url = db.Column(db.String(500))  # For external resources
    file_path = db.Column(db.String(500))  # For uploaded files
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    class_ = db.relationship('Class', back_populates='resources')
    creator = db.relationship('User', back_populates='created_resources')

    def to_dict(self):
        return {
            'id': self.id,
            'class_id': self.class_id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'url': self.url,
            'file_path': self.file_path,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 