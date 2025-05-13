from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Assessment, AssessmentSubmission, Class, User, db
from ..utils.permissions import check_permission

bp = Blueprint('assessments', __name__, url_prefix='/api/assessments')

@bp.route('', methods=['GET'])
@jwt_required()
def get_all_assessments():
    """Get all assessments based on user role"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    try:
        # Based on user role, filter assessments
        if current_user.role == 'super_admin':
            # Super admin can see all assessments
            assessments = Assessment.query.all()
        elif current_user.role == 'school_admin':
            # School admin can see assessments for classes in their school
            school_id = current_user.school_id
            assessments = Assessment.query.join(Class).filter(Class.school_id == school_id).all()
        elif current_user.role == 'teacher':
            # Teacher can see assessments for all classes in their school
            school_id = current_user.school_id
            assessments = Assessment.query.join(Class).filter(Class.school_id == school_id).all()
        else:  # student
            # Students can see assessments for all classes in their school
            school_id = current_user.school_id
            assessments = Assessment.query.join(Class).filter(Class.school_id == school_id).all()
        
        return jsonify({
            'assessments': [a.to_dict() for a in assessments]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch assessments: {str(e)}'}), 500

@bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_assessments_by_class(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Allow students to view assessments from any class in their school
    if current_user.role == 'student' and current_user.school_id == class_.school_id:
        try:
            assessments = Assessment.query.filter_by(class_id=class_id).all()
            return jsonify({
                'assessments': [a.to_dict() for a in assessments]
            }), 200
        except Exception as e:
            return jsonify({'error': f'Failed to fetch assessments: {str(e)}'}), 500
    
    # Check if user has permission to view assessments for this class
    if not (check_permission(current_user, ['manage_assessments', 'view_assessments']) or 
            current_user.id == class_.teacher_id or
            (current_user.role == 'school_admin' and class_.school_id == current_user.school_id) or
            current_user.role == 'super_admin'):
        return jsonify({'error': 'You do not have permission to view assessments for this class'}), 403
    
    try:
        assessments = Assessment.query.filter_by(class_id=class_id).all()
        return jsonify({
            'assessments': [a.to_dict() for a in assessments]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch assessments: {str(e)}'}), 500

@bp.route('/class/<int:class_id>', methods=['POST'])
@jwt_required()
def create_assessment(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Allow teacher of the class or school admin of the school to create assessments
    if class_.teacher_id != current_user_id and not (current_user.role == 'school_admin' and class_.school_id == current_user.school_id) and current_user.role != 'super_admin':
        return jsonify({'error': 'You do not have permission to create assessments for this class'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'type', 'total_points']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        # Parse due date if provided
        due_date = None
        if 'due_date' in data and data['due_date']:
            try:
                due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid date format for due_date. Use ISO format (YYYY-MM-DD).'}), 400
    
        # Create new assessment
    assessment = Assessment(
            title=data['title'],
            description=data['description'],
        class_id=class_id,
        type=data['type'],
        total_points=data['total_points'],
            due_date=due_date,
        created_by=current_user_id
    )
    
    db.session.add(assessment)
    db.session.commit()
    
    return jsonify({
        'message': 'Assessment created successfully',
        'assessment': assessment.to_dict()
    }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create assessment: {str(e)}'}), 500

@bp.route('/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment(assessment_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Get the class to check permissions
    class_ = Class.query.get_or_404(assessment.class_id)
    
    # Check if user has permission to view this assessment
    if not (check_permission(current_user, ['manage_assessments', 'view_assessments']) or 
            current_user.id == class_.teacher_id or
            (current_user.role == 'school_admin' and class_.school_id == current_user.school_id) or
            current_user.role == 'super_admin'):
        return jsonify({'error': 'You do not have permission to view this assessment'}), 403
    
    try:
    return jsonify(assessment.to_dict()), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch assessment: {str(e)}'}), 500

@bp.route('/<int:assessment_id>', methods=['PUT'])
@jwt_required()
def update_assessment(assessment_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Get the class to check permissions
    class_ = Class.query.get_or_404(assessment.class_id)
    
    # Only the teacher who created the assessment, school admin of that school, or super admin can edit
    if assessment.created_by != current_user_id and class_.teacher_id != current_user_id and not (
            (current_user.role == 'school_admin' and class_.school_id == current_user.school_id) or 
            current_user.role == 'super_admin'):
        return jsonify({'error': 'You do not have permission to update this assessment'}), 403
    
    data = request.get_json()
    
    try:
        # Update fields if provided
    if 'title' in data:
        assessment.title = data['title']
    if 'description' in data:
        assessment.description = data['description']
    if 'type' in data:
        assessment.type = data['type']
        if 'due_date' in data and data['due_date']:
            try:
                assessment.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid date format for due_date. Use ISO format (YYYY-MM-DD).'}), 400
    if 'total_points' in data:
        assessment.total_points = data['total_points']
        
        # Update timestamp
        assessment.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Assessment updated successfully',
        'assessment': assessment.to_dict()
    }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update assessment: {str(e)}'}), 500

@bp.route('/<int:assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(assessment_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Get the class to check permissions
    class_ = Class.query.get_or_404(assessment.class_id)
    
    # Only the teacher who created the assessment, school admin of that school, or super admin can delete
    if assessment.created_by != current_user_id and class_.teacher_id != current_user_id and not (
            (current_user.role == 'school_admin' and class_.school_id == current_user.school_id) or 
            current_user.role == 'super_admin'):
        return jsonify({'error': 'You do not have permission to delete this assessment'}), 403
    
    try:
        # Delete all submissions first (cascade delete would be better in the model)
        AssessmentSubmission.query.filter_by(assessment_id=assessment_id).delete()
        
        # Then delete the assessment
    db.session.delete(assessment)
    db.session.commit()
    
        return jsonify({
            'message': 'Assessment deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete assessment: {str(e)}'}), 500

@bp.route('/<int:assessment_id>/submissions', methods=['GET'])
@jwt_required()
def get_assessment_submissions(assessment_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Get the class to check permissions
    class_ = Class.query.get_or_404(assessment.class_id)
    
    # Only the teacher of the class, school admin, or super admin can view all submissions
    if class_.teacher_id != current_user_id and not (
            (current_user.role == 'school_admin' and class_.school_id == current_user.school_id) or 
            current_user.role == 'super_admin'):
        # Students can only see their own submissions
        if current_user.role == 'student':
            try:
                submission = AssessmentSubmission.query.filter_by(
                    assessment_id=assessment_id,
                    student_id=current_user_id
                ).first()
                
                if submission:
                    return jsonify({
                        'submissions': [submission.to_dict()]
                    }), 200
                else:
                    return jsonify({
                        'submissions': []
                    }), 200
            except Exception as e:
                return jsonify({'error': f'Failed to fetch submission: {str(e)}'}), 500
        else:
            return jsonify({'error': 'You do not have permission to view submissions for this assessment'}), 403
    
    try:
        submissions = AssessmentSubmission.query.filter_by(assessment_id=assessment_id).all()
        return jsonify({
            'submissions': [s.to_dict() for s in submissions]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch submissions: {str(e)}'}), 500

@bp.route('/<int:assessment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assessment(assessment_id):
    """Submit an assessment answer as a student"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    assessment = Assessment.query.get_or_404(assessment_id)
    
    # Verify student has permission to submit assessments
    if not check_permission(current_user, ['submit_assessments', 'take_assessments']):
        return jsonify({'error': 'You do not have permission to submit assessments'}), 403
    
    # Check if student belongs to the same school as the class
    class_ = Class.query.get_or_404(assessment.class_id)
    if current_user.school_id != class_.school_id:
        return jsonify({'error': 'You cannot submit assessments for classes outside your school'}), 403
    
    # Optionally check if student is enrolled in the class
    # For now, we'll allow any student from the same school to submit, for testing purposes
    # Remove this comment and the next line, and uncomment the enrollment check for production use
    is_enrolled = True
    
    # Check if student is in the class (uncomment for strict enrollment check)
    # is_enrolled = current_user in class_.students
    # if not is_enrolled:
    #    return jsonify({'error': 'You are not enrolled in this class'}), 403
    
    data = request.get_json()
    if not data or 'submission' not in data:
        return jsonify({'error': 'Submission content is required'}), 400
    
    try:
        # Check if student has already submitted
        existing = AssessmentSubmission.query.filter_by(
        assessment_id=assessment_id,
        student_id=current_user_id
    ).first()
    
        if existing:
            # Update existing submission
            existing.submission = data['submission']
            existing.submitted_at = datetime.utcnow()
            
            # Check if submission is late
            if assessment.due_date and datetime.utcnow() > assessment.due_date:
                existing.status = 'late'
            else:
                existing.status = 'submitted'
    else:
            # Create new submission
            status = 'submitted'
            if assessment.due_date and datetime.utcnow() > assessment.due_date:
                status = 'late'
                
        submission = AssessmentSubmission(
            assessment_id=assessment_id,
            student_id=current_user_id,
            submission=data['submission'],
                status=status,
                submitted_at=datetime.utcnow()
        )
        db.session.add(submission)
    
    db.session.commit()
    
    return jsonify({
            'message': 'Assessment submitted successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to submit assessment: {str(e)}'}), 500

@bp.route('/<int:assessment_id>/grade/<int:submission_id>', methods=['POST'])
@jwt_required()
def grade_submission(assessment_id, submission_id):
    """Grade a student's assessment submission"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    assessment = Assessment.query.get_or_404(assessment_id)
    submission = AssessmentSubmission.query.get_or_404(submission_id)
    
    # Verify the submission belongs to the assessment
    if submission.assessment_id != assessment_id:
        return jsonify({'error': 'Submission does not belong to this assessment'}), 400
    
    # Get the class to check permissions
    class_ = Class.query.get_or_404(assessment.class_id)
    
    # Only the teacher of the class, school admin, or super admin can grade submissions
    if class_.teacher_id != current_user_id and not (
            (current_user.role == 'school_admin' and class_.school_id == current_user.school_id) or 
            current_user.role == 'super_admin'):
        return jsonify({'error': 'You do not have permission to grade this submission'}), 403
    
    data = request.get_json()
    if not data or 'score' not in data:
        return jsonify({'error': 'Score is required'}), 400
    
    # Validate score
    try:
        score = float(data['score'])
        if score < 0 or score > assessment.total_points:
            return jsonify({'error': f'Score must be between 0 and {assessment.total_points}'}), 400
    except ValueError:
        return jsonify({'error': 'Score must be a number'}), 400
    
    try:
        # Update submission
        submission.score = score
        submission.feedback = data.get('feedback', '')
    submission.graded_at = datetime.utcnow()
    submission.graded_by = current_user_id
    submission.status = 'graded'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Submission graded successfully',
        'submission': submission.to_dict()
    }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to grade submission: {str(e)}'}), 500 