from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Attendance, Class, User, db

bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

@bp.route('/class/<int:class_id>', methods=['POST'])
@jwt_required()
def mark_attendance(class_id):
    current_user_id = get_jwt_identity()
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user is the teacher of this class
    if class_.teacher_id != current_user_id:
        return jsonify({'error': 'Only the class teacher can mark attendance'}), 403
    
    data = request.get_json()
    if not data or not data.get('date') or not data.get('attendance_records'):
        return jsonify({'error': 'Date and attendance records are required'}), 400
    
    try:
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Process attendance records
    for record in data['attendance_records']:
        if not record.get('student_id') or not record.get('status'):
            continue
        
        # Check if student is enrolled in the class
        student = User.query.get(record['student_id'])
        if not student or student not in class_.students:
            continue
        
        # Create or update attendance record
        attendance = Attendance.query.filter_by(
            class_id=class_id,
            student_id=record['student_id'],
            date=date
        ).first()
        
        if attendance:
            attendance.status = record['status']
            attendance.notes = record.get('notes')
        else:
            attendance = Attendance(
                class_id=class_id,
                student_id=record['student_id'],
                date=date,
                status=record['status'],
                notes=record.get('notes')
            )
            db.session.add(attendance)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Attendance marked successfully',
        'date': date.isoformat()
    }), 200

@bp.route('/class/<int:class_id>/date/<date>', methods=['GET'])
@jwt_required()
def get_attendance(class_id, date):
    current_user_id = get_jwt_identity()
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user is the teacher or a student in the class
    if class_.teacher_id != current_user_id:
        user = User.query.get(current_user_id)
        if user not in class_.students:
            return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        date = datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    attendance_records = Attendance.query.filter_by(
        class_id=class_id,
        date=date
    ).all()
    
    return jsonify({
        'date': date.isoformat(),
        'attendance': [record.to_dict() for record in attendance_records]
    }), 200

@bp.route('/student/<int:student_id>/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_student_attendance(student_id, class_id):
    current_user_id = get_jwt_identity()
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user is the teacher or the student themselves
    if class_.teacher_id != current_user_id and current_user_id != student_id:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    attendance_records = Attendance.query.filter_by(
        class_id=class_id,
        student_id=student_id
    ).order_by(Attendance.date.desc()).all()
    
    return jsonify({
        'student_id': student_id,
        'class_id': class_id,
        'attendance': [record.to_dict() for record in attendance_records]
    }), 200 