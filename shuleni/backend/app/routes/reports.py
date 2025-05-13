from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from ..models import User, School, Class, Student, Assessment, AssessmentSubmission, db
from ..utils.permissions import check_permission
import random

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    """Get system analytics based on user role"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Check permissions
    if not check_permission(current_user, ['view_analytics', 'view_school_analytics']):
        return jsonify({'error': 'You do not have permission to view analytics'}), 403
    
    try:
        # Get query parameters
        report_type = request.args.get('type', 'performance')
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        # Default date range if not provided
        if not start_date_str:
            start_date = datetime.now() - timedelta(days=30)
        else:
            start_date = datetime.fromisoformat(start_date_str)
            
        if not end_date_str:
            end_date = datetime.now()
        else:
            end_date = datetime.fromisoformat(end_date_str)
        
        # Different data based on role
        if current_user.role == 'super_admin':
            return generate_system_analytics(report_type, start_date, end_date)
        elif current_user.role == 'school_admin':
            return generate_school_analytics(current_user.school_id, report_type, start_date, end_date)
        else:
            return jsonify({'error': 'Unsupported role for analytics'}), 403
            
    except Exception as e:
        return jsonify({'error': f'Failed to generate analytics: {str(e)}'}), 500

@bp.route('/performance', methods=['GET'])
@jwt_required()
def get_performance_report():
    """Get performance report"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Check permissions
    if not check_permission(current_user, ['view_reports', 'view_school_reports', 'view_class_reports']):
        return jsonify({'error': 'You do not have permission to view reports'}), 403
    
    try:
        class_id = request.args.get('class_id')
        
        # Super admin can see all performance data
        if current_user.role == 'super_admin':
            if class_id:
                # Specific class performance
                return get_class_performance(class_id)
            else:
                # System-wide performance
                return get_system_performance()
                
        # School admin can see school performance data
        elif current_user.role == 'school_admin':
            if class_id:
                # Check if class belongs to admin's school
                class_obj = Class.query.get(class_id)
                if class_obj and class_obj.school_id == current_user.school_id:
                    return get_class_performance(class_id)
                else:
                    return jsonify({'error': 'Class not found or not in your school'}), 404
            else:
                # School-wide performance
                return get_school_performance(current_user.school_id)
                
        # Teacher can see their class performance
        elif current_user.role == 'teacher':
            if class_id:
                # Check if teacher teaches this class
                class_obj = Class.query.get(class_id)
                if class_obj and class_obj.teacher_id == current_user_id:
                    return get_class_performance(class_id)
                else:
                    return jsonify({'error': 'Class not found or not taught by you'}), 404
            else:
                # Get all classes taught by this teacher
                teacher_classes = Class.query.filter_by(teacher_id=current_user_id).all()
                class_data = []
                for c in teacher_classes:
                    class_data.append({
                        'id': c.id,
                        'name': c.name,
                        'performance': random.randint(65, 95)  # Mock data
                    })
                return jsonify({'classes': class_data}), 200
        else:
            return jsonify({'error': 'Unsupported role for this report'}), 403
            
    except Exception as e:
        return jsonify({'error': f'Failed to generate report: {str(e)}'}), 500

# Helper functions to generate mock data
def generate_system_analytics(report_type, start_date, end_date):
    schools = School.query.all()
    school_count = len(schools)
    
    students = Student.query.count()
    classes = Class.query.count()
    
    return jsonify({
        'report_type': report_type,
        'date_range': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat()
        },
        'summary': {
            'total_schools': school_count,
            'total_students': students,
            'total_classes': classes,
            'average_performance': random.randint(70, 85),
            'attendance_rate': random.randint(85, 98)
        },
        'schools': [
            {
                'id': school.id,
                'name': school.name,
                'student_count': random.randint(100, 500),
                'performance': random.randint(70, 90),
                'attendance': random.randint(80, 95)
            } for school in schools
        ]
    }), 200

def generate_school_analytics(school_id, report_type, start_date, end_date):
    school = School.query.get(school_id)
    
    if not school:
        return jsonify({'error': 'School not found'}), 404
        
    classes = Class.query.filter_by(school_id=school_id).all()
    class_count = len(classes)
    
    students = Student.query.filter_by(school_id=school_id).count()
    
    return jsonify({
        'report_type': report_type,
        'date_range': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat()
        },
        'school': {
            'id': school.id,
            'name': school.name
        },
        'summary': {
            'total_students': students,
            'total_classes': class_count,
            'average_performance': random.randint(70, 85),
            'attendance_rate': random.randint(85, 98)
        },
        'classes': [
            {
                'id': class_obj.id,
                'name': class_obj.name,
                'student_count': random.randint(20, 40),
                'performance': random.randint(70, 90),
                'attendance': random.randint(80, 95)
            } for class_obj in classes
        ]
    }), 200

def get_class_performance(class_id):
    # Mock data for class performance
    return jsonify({
        'class_id': class_id,
        'performance': {
            'average_score': random.randint(65, 90),
            'assessments': [
                {'title': 'Mid-term Exam', 'average': random.randint(60, 85)},
                {'title': 'Final Exam', 'average': random.randint(70, 95)},
                {'title': 'Project', 'average': random.randint(75, 90)}
            ]
        }
    }), 200

def get_school_performance(school_id):
    # Mock data for school performance
    classes = Class.query.filter_by(school_id=school_id).all()
    
    return jsonify({
        'school_id': school_id,
        'performance': {
            'average_score': random.randint(70, 90),
            'classes': [
                {
                    'id': class_obj.id,
                    'name': class_obj.name,
                    'average': random.randint(65, 95)
                } for class_obj in classes
            ]
        }
    }), 200

def get_system_performance():
    # Mock data for system-wide performance
    schools = School.query.all()
    
    return jsonify({
        'performance': {
            'average_score': random.randint(75, 85),
            'schools': [
                {
                    'id': school.id,
                    'name': school.name,
                    'average': random.randint(70, 90)
                } for school in schools
            ]
        }
    }), 200 