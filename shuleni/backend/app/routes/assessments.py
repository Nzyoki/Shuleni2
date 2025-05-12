from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Assessment, AssessmentSubmission, Class, User, db

bp = Blueprint('assessments', __name__, url_prefix='/api/assessments')

@bp.route('/class/<int:class_id>', methods=['POST'])
@jwt_required()
def create_assessment(class_id):
    current_user_id = get_jwt_identity()
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user is the teacher of this class
    if class_.teacher_id != current_user_id:
        return jsonify({'error': 'Only the class teacher can create assessments'}), 403
    
    data = request.get_json()
    if not data or not data.get('title') or not data.get('type') or not data.get('total_points'):
        return jsonify({'error': 'Title, type, and total points are required'}), 400
    
    # Create assessment
    assessment = Assessment(
        class_id=class_id,
        title=data['title'],
        description=data.get('description', ''),
        type=data['type'],
        total_points=data['total_points'],
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
        created_by=current_user_id
    )
    
    db.session.add(assessment)
    db.session.commit()
    
    return jsonify({
        'message': 'Assessment created successfully',
        'assessment': assessment.to_dict()
    }), 201

@bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_assessments(class_id):
    current_user_id = get_jwt_identity()
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user is the teacher or a student in the class
    if class_.teacher_id != current_user_id:
        user = User.query.get(current_user_id)
        if user not in class_.students:
            return jsonify({'error': 'Unauthorized access'}), 403
    
    assessments = Assessment.query.filter_by(class_id=class_id).order_by(Assessment.created_at.desc()).all()
    
    return jsonify({
        'assessments': [assessment.to_dict() for assessment in assessments]
    }), 200

@bp.route('/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment(assessment_id):
    assessment = Assessment.query.get_or_404(assessment_id)
    class_ = Class.query.get(assessment.class_id)
    
    # Check if user is the teacher or a student in the class
    current_user_id = get_jwt_identity()
    if class_.teacher_id != current_user_id:
        user = User.query.get(current_user_id)
        if user not in class_.students:
            return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify(assessment.to_dict()), 200

@bp.route('/<int:assessment_id>', methods=['PUT'])
@jwt_required()
def update_assessment(assessment_id):
    current_user_id = get_jwt_identity()
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Check if user is the creator of the assessment
    if assessment.created_by != current_user_id:
        return jsonify({'error': 'Only the assessment creator can update it'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        assessment.title = data['title']
    if 'description' in data:
        assessment.description = data['description']
    if 'type' in data:
        assessment.type = data['type']
    if 'total_points' in data:
        assessment.total_points = data['total_points']
    if 'due_date' in data:
        assessment.due_date = datetime.fromisoformat(data['due_date'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Assessment updated successfully',
        'assessment': assessment.to_dict()
    }), 200

@bp.route('/<int:assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(assessment_id):
    current_user_id = get_jwt_identity()
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Check if user is the creator of the assessment
    if assessment.created_by != current_user_id:
        return jsonify({'error': 'Only the assessment creator can delete it'}), 403
    
    db.session.delete(assessment)
    db.session.commit()
    
    return jsonify({'message': 'Assessment deleted successfully'}), 200

@bp.route('/<int:assessment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assessment(assessment_id):
    current_user_id = get_jwt_identity()
    assessment = Assessment.query.get_or_404(assessment_id)
    class_ = Class.query.get(assessment.class_id)
    
    # Check if user is a student in the class
    user = User.query.get(current_user_id)
    if user not in class_.students:
        return jsonify({'error': 'Only enrolled students can submit assessments'}), 403
    
    data = request.get_json()
    if not data or not data.get('submission'):
        return jsonify({'error': 'Submission content is required'}), 400
    
    # Check if submission already exists
    submission = AssessmentSubmission.query.filter_by(
        assessment_id=assessment_id,
        student_id=current_user_id
    ).first()
    
    if submission:
        submission.submission = data['submission']
        submission.submitted_at = datetime.utcnow()
        submission.status = 'submitted'
    else:
        submission = AssessmentSubmission(
            assessment_id=assessment_id,
            student_id=current_user_id,
            submission=data['submission'],
            status='submitted'
        )
        db.session.add(submission)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Assessment submitted successfully',
        'submission': submission.to_dict()
    }), 200

@bp.route('/<int:assessment_id>/grade/<int:submission_id>', methods=['POST'])
@jwt_required()
def grade_submission(assessment_id, submission_id):
    current_user_id = get_jwt_identity()
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Check if user is the teacher of the class
    if assessment.created_by != current_user_id:
        return jsonify({'error': 'Only the assessment creator can grade submissions'}), 403
    
    submission = AssessmentSubmission.query.get_or_404(submission_id)
    if submission.assessment_id != assessment_id:
        return jsonify({'error': 'Invalid submission for this assessment'}), 400
    
    data = request.get_json()
    if not data or not data.get('score'):
        return jsonify({'error': 'Score is required'}), 400
    
    submission.score = data['score']
    submission.feedback = data.get('feedback')
    submission.graded_at = datetime.utcnow()
    submission.graded_by = current_user_id
    submission.status = 'graded'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Submission graded successfully',
        'submission': submission.to_dict()
    }), 200

@bp.route('/<int:assessment_id>/submissions', methods=['GET'])
@jwt_required()
def get_submissions(assessment_id):
    current_user_id = get_jwt_identity()
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Check if user is the teacher of the class
    if assessment.created_by != current_user_id:
        return jsonify({'error': 'Only the assessment creator can view submissions'}), 403
    
    submissions = AssessmentSubmission.query.filter_by(assessment_id=assessment_id).all()
    
    return jsonify({
        'submissions': [submission.to_dict() for submission in submissions]
    }), 200 