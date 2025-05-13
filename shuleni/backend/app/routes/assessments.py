from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Assessment, AssessmentSubmission, Class, User, db
from ..utils.permissions import check_permission

bp = Blueprint('assessments', __name__, url_prefix='/api/assessments')

@bp.route('', methods=['GET'])
@jwt_required()
def get_assessments():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role == 'super_admin':
        assessments = Assessment.query.all()
    elif current_user.role == 'school_admin':
        school_classes = Class.query.filter_by(school_id=current_user.school_id).all()
        class_ids = [c.id for c in school_classes]
        assessments = Assessment.query.filter(Assessment.class_id.in_(class_ids)).all()
    elif current_user.role == 'teacher':
        school_classes = Class.query.filter_by(school_id=current_user.school_id).all()
        class_ids = [c.id for c in school_classes]
        assessments = Assessment.query.filter(Assessment.class_id.in_(class_ids)).all()
    else:
        enrolled_classes = current_user.classes_enrolled
        class_ids = [c.id for c in enrolled_classes]
        assessments = Assessment.query.filter(Assessment.class_id.in_(class_ids)).all()
    
    return jsonify([assessment.to_dict() for assessment in assessments]), 200

@bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_assessments(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    class_ = Class.query.get_or_404(class_id)
    
    if current_user.role == 'student' and current_user.school_id == class_.school_id:
        assessments = Assessment.query.filter_by(class_id=class_id).all()
        return jsonify([assessment.to_dict() for assessment in assessments]), 200
        
    if not current_user.has_permission('view_assessments'):
        return jsonify({'error': 'Permission denied'}), 403
        
    assessments = Assessment.query.filter_by(class_id=class_id).all()
    return jsonify([assessment.to_dict() for assessment in assessments]), 200

@bp.route('/class/<int:class_id>', methods=['POST'])
@jwt_required()
def create_assessment(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    class_ = Class.query.get_or_404(class_id)
    
    if not (current_user.has_permission('create_assessments') and 
            (current_user.id == class_.teacher_id or 
             (current_user.role == 'school_admin' and current_user.school_id == class_.school_id))):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    
    if not all(k in data for k in ['title', 'description', 'total_marks']):
        return jsonify({'error': 'Missing required fields'}), 400
        
    due_date = None
    if data.get('due_date'):
        try:
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid due date format'}), 400
            
    assessment = Assessment(
        title=data['title'],
        description=data['description'],
        total_marks=data['total_marks'],
        due_date=due_date,
        class_id=class_id,
        created_by=current_user_id
    )
    
    db.session.add(assessment)
    db.session.commit()
    
    return jsonify(assessment.to_dict()), 201

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_assessment(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    assessment = Assessment.query.get_or_404(id)
    class_ = Class.query.get_or_404(assessment.class_id)
    
    if not current_user.has_permission('view_assessments'):
        return jsonify({'error': 'Permission denied'}), 403
        
    return jsonify(assessment.to_dict()), 200

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_assessment(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    assessment = Assessment.query.get_or_404(id)
    class_ = Class.query.get_or_404(assessment.class_id)
    
    if not ((current_user.id == assessment.created_by and current_user.has_permission('create_assessments')) or
            (current_user.role == 'school_admin' and current_user.school_id == class_.school_id) or
            current_user.role == 'super_admin'):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    
    if data.get('title'):
        assessment.title = data['title']
    if data.get('description'):
        assessment.description = data['description']
    if data.get('total_marks'):
        assessment.total_marks = data['total_marks']
    if data.get('due_date'):
        try:
            assessment.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid due date format'}), 400
            
    assessment.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(assessment.to_dict()), 200

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    assessment = Assessment.query.get_or_404(id)
    class_ = Class.query.get_or_404(assessment.class_id)
    
    if not ((current_user.id == assessment.created_by and current_user.has_permission('create_assessments')) or
            (current_user.role == 'school_admin' and current_user.school_id == class_.school_id) or
            current_user.role == 'super_admin'):
        return jsonify({'error': 'Permission denied'}), 403
    
    AssessmentSubmission.query.filter_by(assessment_id=id).delete()
    
    db.session.delete(assessment)
    db.session.commit()
    
    return '', 204

@bp.route('/<int:id>/submissions', methods=['GET'])
@jwt_required()
def get_assessment_submissions(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    assessment = Assessment.query.get_or_404(id)
    class_ = Class.query.get_or_404(assessment.class_id)
    
    if not ((current_user.id == class_.teacher_id and current_user.has_permission('grade_assessments')) or
            (current_user.role in ['school_admin', 'super_admin'])):
        if current_user.role == 'student':
            submissions = AssessmentSubmission.query.filter_by(
                assessment_id=id,
                student_id=current_user_id
            ).all()
            return jsonify([submission.to_dict() for submission in submissions]), 200
        return jsonify({'error': 'Permission denied'}), 403
    
    submissions = AssessmentSubmission.query.filter_by(assessment_id=id).all()
    return jsonify([submission.to_dict() for submission in submissions]), 200

@bp.route('/<int:id>/submit', methods=['POST'])
@jwt_required()
def submit_assessment(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user.has_permission('take_assessments'):
        return jsonify({'error': 'Permission denied'}), 403
        
    assessment = Assessment.query.get_or_404(id)
    class_ = Class.query.get_or_404(assessment.class_id)
    
    if current_user.school_id != class_.school_id:
        return jsonify({'error': 'You cannot submit to assessments from other schools'}), 403
        
    is_enrolled = True
    
    if not is_enrolled:
        return jsonify({'error': 'You are not enrolled in this class'}), 403
        
    data = request.get_json()
    
    existing_submission = AssessmentSubmission.query.filter_by(
        assessment_id=id,
        student_id=current_user_id
    ).first()
    
    if existing_submission:
        existing_submission.content = data.get('content', '')
        existing_submission.updated_at = datetime.utcnow()
    else:
        is_late = False
        if assessment.due_date and datetime.utcnow() > assessment.due_date:
            is_late = True
            
        submission = AssessmentSubmission(
            assessment_id=id,
            student_id=current_user_id,
            content=data.get('content', ''),
            is_late=is_late
        )
        db.session.add(submission)
    
    db.session.commit()
    
    return jsonify(existing_submission.to_dict() if existing_submission else submission.to_dict()), 200

@bp.route('/submissions/<int:submission_id>/grade', methods=['POST'])
@jwt_required()
def grade_submission(submission_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    submission = AssessmentSubmission.query.get_or_404(submission_id)
    assessment = Assessment.query.get_or_404(submission.assessment_id)
    class_ = Class.query.get_or_404(assessment.class_id)
    
    if not ((current_user.id == class_.teacher_id and current_user.has_permission('grade_assessments')) or
            (current_user.role in ['school_admin', 'super_admin'])):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    
    if not isinstance(data.get('score'), (int, float)) or data['score'] < 0 or data['score'] > assessment.total_marks:
        return jsonify({'error': f'Score must be between 0 and {assessment.total_marks}'}), 400
        
    submission.score = data['score']
    submission.feedback = data.get('feedback', '')
    submission.graded_by = current_user_id
    submission.graded_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify(submission.to_dict()), 200 