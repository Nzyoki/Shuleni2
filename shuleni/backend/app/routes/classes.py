from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.class_ import Class
from ..models.user import User
from ..models.school import School
from .. import db

bp = Blueprint('classes', __name__, url_prefix='/api/classes')

@bp.route('', methods=['POST'])
@jwt_required()
def create_class():
    data = request.get_json()
    
    if not all(k in data for k in ['name', 'school_id', 'teacher_id']):
        return jsonify({'error': 'Missing required fields'}), 400
        
    school = School.query.get_or_404(data['school_id'])
    
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user.has_permission('manage_classes'):
        return jsonify({'error': 'Permission denied'}), 403
        
    if current_user.role == 'school_admin' and current_user.school_id != school.id:
        return jsonify({'error': 'Permission denied'}), 403
        
    class_ = Class(
        name=data['name'],
        description=data.get('description', ''),
        school_id=data['school_id'],
        teacher_id=data['teacher_id']
    )
    
    db.session.add(class_)
    db.session.commit()
    
    return jsonify(class_.to_dict()), 201

@bp.route('', methods=['GET'])
@jwt_required()
def get_classes():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role == 'super_admin':
        classes = Class.query.all()
    elif current_user.role == 'school_admin':
        classes = Class.query.filter_by(school_id=current_user.school_id).all()
    elif current_user.role == 'teacher':
        classes = Class.query.filter_by(school_id=current_user.school_id).all()
    else:
        classes = Class.query.filter_by(school_id=current_user.school_id).all()
        
    result = []
    for class_ in classes:
        class_dict = class_.to_dict()
        class_dict['enrolled'] = current_user in class_.students
        result.append(class_dict)
    
    return jsonify(result), 200

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_class(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(id)
    
    if not (current_user.has_permission('view_classes') or 
            current_user.id == class_.teacher_id or
            current_user in class_.students):
        return jsonify({'error': 'Permission denied'}), 403
        
    return jsonify(class_.to_dict()), 200

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_class(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(id)
    
    if not (current_user.has_permission('manage_classes') or 
            current_user.id == class_.teacher_id):
        return jsonify({'error': 'Permission denied'}), 403
        
    data = request.get_json()
    
    if data.get('name'):
        class_.name = data['name']
    if data.get('description'):
        class_.description = data['description']
    if data.get('teacher_id'):
        new_teacher = User.query.get_or_404(data['teacher_id'])
        if new_teacher.school_id != class_.school_id:
            return jsonify({'error': 'Teacher must be from the same school'}), 400
        class_.teacher_id = data['teacher_id']
        
    db.session.commit()
    
    return jsonify(class_.to_dict()), 200

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_class(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(id)
    
    if not current_user.has_permission('manage_classes'):
        return jsonify({'error': 'Permission denied'}), 403
        
    db.session.delete(class_)
    db.session.commit()
    
    return '', 204

@bp.route('/<int:id>/students', methods=['POST'])
@jwt_required()
def add_student(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(id)
    
    if not (current_user.has_permission('manage_classes') or 
            current_user.id == class_.teacher_id):
        return jsonify({'error': 'Permission denied'}), 403
        
    data = request.get_json()
    if not data or 'student_id' not in data:
        return jsonify({'error': 'Student ID is required'}), 400
        
    student = User.query.get_or_404(data['student_id'])
    
    if student.school_id != class_.school_id:
        return jsonify({'error': 'Student must be from the same school'}), 400
        
    if student not in class_.students:
        class_.students.append(student)
        db.session.commit()
    
    return jsonify(class_.to_dict()), 200

@bp.route('/<int:id>/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def remove_student(id, student_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(id)
    
    if not (current_user.has_permission('manage_classes') or 
            current_user.id == class_.teacher_id):
        return jsonify({'error': 'Permission denied'}), 403
        
    student = User.query.get_or_404(student_id)
    
    if student in class_.students:
        class_.students.remove(student)
        db.session.commit()
    
    return '', 204

@bp.route('/enroll-all-students', methods=['POST'])
@jwt_required()
def enroll_all_students():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user.role in ['super_admin', 'school_admin']:
        return jsonify({'error': 'Permission denied'}), 403
        
    schools = School.query.all()
    for school in schools:
        students = User.query.filter_by(
            school_id=school.id,
            role='student'
        ).all()
        
        classes = Class.query.filter_by(school_id=school.id).all()
        
        for student in students:
            for class_ in classes:
                if student not in class_.students:
                    class_.students.append(student)
    
    db.session.commit()
    return jsonify({'message': 'All students enrolled in their school classes'}), 200 