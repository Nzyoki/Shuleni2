from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .. import db

class_students = db.Table('class_students',
    db.Column('class_id', db.Integer, db.ForeignKey('classes.id'), primary_key=True),
    db.Column('student_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

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
    school = db.relationship('School', backref=db.backref('users', lazy=True))
    classes_teaching = db.relationship('Class', backref='teacher', lazy=True)
    classes_enrolled = db.relationship('Class', secondary=class_students, lazy='subquery',
        backref=db.backref('students', lazy=True))
    assessments_created = db.relationship('Assessment', backref='creator', lazy=True)
    assessment_submissions = db.relationship('AssessmentSubmission', backref='student', lazy=True)
    attendance_records = db.relationship('Attendance', backref='student', lazy=True)
    resources_created = db.relationship('Resource', backref='creator', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def has_permission(self, permission):
        """Check if user has a specific permission based on their role"""
        role_permissions = {
            'super_admin': [
                'manage_schools', 'manage_users', 'manage_classes',
                'manage_assessments', 'grade_assessments', 'take_assessments',
                'manage_attendance', 'manage_resources', 'participate_chat'
            ],
            'school_admin': [
                'manage_users', 'manage_classes', 'manage_assessments',
                'grade_assessments', 'manage_attendance', 'manage_resources',
                'participate_chat'
            ],
            'teacher': [
                'manage_classes', 'manage_assessments', 'grade_assessments',
                'manage_attendance', 'manage_resources', 'participate_chat'
            ],
            'student': [
                'take_assessments', 'view_resources', 'participate_chat'
            ]
        }
        return permission in role_permissions.get(self.role, [])

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'school_id': self.school_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 