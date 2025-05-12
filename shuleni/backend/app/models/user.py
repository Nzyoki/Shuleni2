from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .. import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'super_admin', 'school_admin', 'teacher', 'student'
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=True)  # Nullable for super_admin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    school = db.relationship('School', back_populates='users')
    classes_teaching = db.relationship('Class', back_populates='teacher', foreign_keys='Class.teacher_id')
    classes_enrolled = db.relationship('Class', secondary='class_students', back_populates='students')
    
    # New relationships
    attendance = db.relationship('Attendance', back_populates='student')
    created_resources = db.relationship('Resource', back_populates='creator')
    created_assessments = db.relationship('Assessment', back_populates='creator')
    submissions = db.relationship('AssessmentSubmission', back_populates='student', foreign_keys='AssessmentSubmission.student_id')
    graded_submissions = db.relationship('AssessmentSubmission', back_populates='grader', foreign_keys='AssessmentSubmission.graded_by')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def has_permission(self, permission):
        """Check if user has a specific permission based on their role"""
        permissions = {
            'super_admin': [
                'manage_platform',
                'manage_schools',
                'manage_all_users',
                'view_analytics',
                'manage_settings'
            ],
            'school_admin': [
                'manage_school',
                'manage_teachers',
                'manage_students',
                'manage_classes',
                'manage_resources',
                'manage_assessments',
                'view_attendance',
                'monitor_chat'
            ],
            'teacher': [
                'manage_class',
                'take_attendance',
                'manage_resources',
                'create_assessments',
                'grade_assessments',
                'participate_chat',
                'send_notifications'
            ],
            'student': [
                'view_resources',
                'take_assessments',
                'view_attendance',
                'participate_chat',
                'update_profile'
            ]
        }
        return permission in permissions.get(self.role, [])

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'school_id': self.school_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 