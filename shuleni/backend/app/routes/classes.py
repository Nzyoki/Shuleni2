from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Class, User, School, class_students, db
from ..utils.permissions import check_permission

bp = Blueprint('classes', __name__, url_prefix='/api/classes')

@bp.route('', methods=['POST'])
@jwt_required()
def create_class():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Validate required fields
    if not data or not data.get('name') or not data.get('school_id'):
        return jsonify({'error': 'Class name and school ID are required'}), 400
    
    # Check if school exists
    school = School.query.get_or_404(data['school_id'])
    
    # Check permissions to create a class
    has_perm = check_permission(current_user, ['create_classes', 'add_class', 'manage_classes'])
    
    if not has_perm:
        return jsonify({'error': 'You do not have permission to create classes'}), 403
    
    # School admin can only create classes for their own school
    if current_user.role == 'school_admin' and current_user.school_id != school.id:
        return jsonify({'error': 'You can only create classes for your own school'}), 403
    
    # Create new class
    new_class = Class(
        name=data['name'],
        description=data.get('description', ''),
        school_id=data['school_id'],
        teacher_id=data.get('teacher_id', current_user_id)
    )
    
    db.session.add(new_class)
    db.session.commit()
    
    return jsonify({
        'message': 'Class created successfully',
        'class': new_class.to_dict()
    }), 201

@bp.route('', methods=['GET'])
@jwt_required()
def get_classes():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role == 'super_admin':
        classes = Class.query.all()
    elif user.role == 'school_admin':
        classes = Class.query.filter_by(school_id=user.school_id).all()
    elif user.role == 'teacher':
        classes = Class.query.filter_by(teacher_id=current_user_id).all()
    else:  # student
        classes = Class.query.join(class_students).filter(
            class_students.c.student_id == current_user_id
        ).all()
    
    return jsonify({
        'classes': [class_.to_dict() for class_ in classes]
    }), 200

@bp.route('/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user has permission to view this class
    if current_user.role == 'school_admin' and current_user.school_id != class_.school_id:
        return jsonify({'error': 'You can only view classes from your own school'}), 403
    
    return jsonify(class_.to_dict()), 200

@bp.route('/<int:class_id>', methods=['PUT'])
@jwt_required()
def update_class(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user has permission to update this class
    is_teacher = class_.teacher_id == current_user_id
    is_school_admin = current_user.role == 'school_admin' and current_user.school_id == class_.school_id
    
    if not (is_teacher or is_school_admin):
        return jsonify({'error': 'Only the class teacher or school admin can update this class'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        class_.name = data['name']
    if 'description' in data:
        class_.description = data['description']
    if 'teacher_id' in data and is_school_admin:
        # Verify the new teacher is from the same school
        new_teacher = User.query.get_or_404(data['teacher_id'])
        if new_teacher.school_id != class_.school_id:
            return jsonify({'error': 'Teacher must belong to the same school as the class'}), 400
        class_.teacher_id = data['teacher_id']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Class updated successfully',
        'class': class_.to_dict()
    }), 200

@bp.route('/<int:class_id>', methods=['DELETE'])
@jwt_required()
def delete_class(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user has permission to delete this class
    is_teacher = class_.teacher_id == current_user_id
    is_school_admin = current_user.role == 'school_admin' and current_user.school_id == class_.school_id
    
    if not (is_teacher or is_school_admin):
        return jsonify({'error': 'Only the class teacher or school admin can delete this class'}), 403
    
    db.session.delete(class_)
    db.session.commit()
    
    return jsonify({'message': 'Class deleted successfully'}), 200

@bp.route('/<int:class_id>/students', methods=['POST'])
@jwt_required()
def add_student(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user has permission to add students to this class
    is_teacher = class_.teacher_id == current_user_id
    is_school_admin = current_user.role == 'school_admin' and current_user.school_id == class_.school_id
    
    if not (is_teacher or is_school_admin):
        return jsonify({'error': 'Only the class teacher or school admin can add students'}), 403
    
    data = request.get_json()
    if not data or not data.get('student_id'):
        return jsonify({'error': 'Student ID is required'}), 400
    
    student = User.query.get_or_404(data['student_id'])
    
    # Check if student belongs to the same school
    if student.school_id != class_.school_id:
        return jsonify({'error': 'Student does not belong to the same school'}), 400
    
    # Add student to class
    if student not in class_.students:
        class_.students.append(student)
        db.session.commit()
    
    return jsonify({
        'message': 'Student added to class successfully',
        'class': class_.to_dict()
    }), 200

@bp.route('/<int:class_id>/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def remove_student(class_id, student_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user has permission to remove students from this class
    is_teacher = class_.teacher_id == current_user_id
    is_school_admin = current_user.role == 'school_admin' and current_user.school_id == class_.school_id
    
    if not (is_teacher or is_school_admin):
        return jsonify({'error': 'Only the class teacher or school admin can remove students'}), 403
    
    student = User.query.get_or_404(student_id)
    
    # Remove student from class
    if student in class_.students:
        class_.students.remove(student)
        db.session.commit()
    
    return jsonify({
        'message': 'Student removed from class successfully',
        'class': class_.to_dict()
    }), 200 