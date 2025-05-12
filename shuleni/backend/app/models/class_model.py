from datetime import datetime
from .. import db

class Class(db.Model):
    __tablename__ = 'classes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    school = db.relationship('School', back_populates='classes')
    teacher = db.relationship('User', back_populates='classes_teaching', foreign_keys=[teacher_id])
    students = db.relationship('User', secondary='class_students', back_populates='classes_enrolled')
    
    # New relationships
    attendance = db.relationship('Attendance', back_populates='class_')
    resources = db.relationship('Resource', back_populates='class_')
    assessments = db.relationship('Assessment', back_populates='class_')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'school_id': self.school_id,
            'teacher_id': self.teacher_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'teacher': self.teacher.to_dict() if self.teacher else None,
            'students': [student.to_dict() for student in self.students]
        }

# Association table for Class-Student many-to-many relationship
class_students = db.Table('class_students',
    db.Column('class_id', db.Integer, db.ForeignKey('classes.id'), primary_key=True),
    db.Column('student_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
) 