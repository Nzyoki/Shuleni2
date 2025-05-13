from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models.attendance import Attendance
from ..models.user import User
from ..models.class_ import Class
from .. import db

bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

@bp.route('/class/<int:class_id>', methods=['POST'])
@jwt_required()
def mark_attendance(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    if current_user.id != class_.teacher_id:
        return jsonify({'error': 'Permission denied'}), 403
        
    data = request.get_json()
    if not data or 'date' not in data or 'records' not in data:
        return jsonify({'error': 'Date and attendance records are required'}), 400
        
    try:
        date = datetime.fromisoformat(data['date'].replace('Z', '+00:00')).date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
        
    for record in data['records']:
        student_id = record.get('student_id')
        status = record.get('status')
        
        if not student_id or not status:
            continue
            
        student = User.query.get(student_id)
        if not student or student not in class_.students:
            continue
            
        attendance = Attendance.query.filter_by(
            class_id=class_id,
            student_id=student_id,
            date=date
        ).first()
        
        if attendance:
            attendance.status = status
        else:
            attendance = Attendance(
                class_id=class_id,
                student_id=student_id,
                date=date,
                status=status,
                marked_by=current_user_id
            )
            db.session.add(attendance)
            
    db.session.commit()
    return jsonify({'message': 'Attendance marked successfully'}), 200

@bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_attendance(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    if not (current_user.id == class_.teacher_id or current_user in class_.students):
        return jsonify({'error': 'Permission denied'}), 403
        
    date = request.args.get('date')
    if date:
        try:
            date = datetime.fromisoformat(date.replace('Z', '+00:00')).date()
            attendance = Attendance.query.filter_by(
                class_id=class_id,
                date=date
            ).all()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    else:
        attendance = Attendance.query.filter_by(class_id=class_id).all()
        
    return jsonify([record.to_dict() for record in attendance]), 200

@bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_attendance(student_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    student = User.query.get_or_404(student_id)
    
    if not (current_user.id == student_id or 
            any(current_user.id == class_.teacher_id for class_ in student.classes_enrolled)):
        return jsonify({'error': 'Permission denied'}), 403
        
    class_id = request.args.get('class_id')
    if class_id:
        attendance = Attendance.query.filter_by(
            student_id=student_id,
            class_id=class_id
        ).all()
    else:
        attendance = Attendance.query.filter_by(student_id=student_id).all()
        
    return jsonify([record.to_dict() for record in attendance]), 200 