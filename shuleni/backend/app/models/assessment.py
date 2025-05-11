from datetime import datetime
from .. import db

class Assessment(db.Model):
    __tablename__ = 'assessments'

    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)  # 'quiz', 'exam', 'assignment'
    total_points = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    class_ = db.relationship('Class', back_populates='assessments')
    creator = db.relationship('User', back_populates='created_assessments')
    submissions = db.relationship('AssessmentSubmission', back_populates='assessment')

    def to_dict(self):
        return {
            'id': self.id,
            'class_id': self.class_id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'total_points': self.total_points,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AssessmentSubmission(db.Model):
    __tablename__ = 'assessment_submissions'

    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    submission = db.Column(db.Text, nullable=False)
    score = db.Column(db.Float)
    feedback = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    graded_at = db.Column(db.DateTime)
    graded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(20), nullable=False)  # 'submitted', 'graded', 'late'

    # Relationships
    assessment = db.relationship('Assessment', back_populates='submissions')
    student = db.relationship('User', foreign_keys=[student_id], back_populates='submissions')
    grader = db.relationship('User', foreign_keys=[graded_by], back_populates='graded_submissions')

    def to_dict(self):
        return {
            'id': self.id,
            'assessment_id': self.assessment_id,
            'student_id': self.student_id,
            'submission': self.submission,
            'score': self.score,
            'feedback': self.feedback,
            'submitted_at': self.submitted_at.isoformat(),
            'graded_at': self.graded_at.isoformat() if self.graded_at else None,
            'graded_by': self.graded_by,
            'status': self.status
        } 