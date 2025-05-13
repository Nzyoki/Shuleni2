from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import School, User, db
from ..utils.permissions import check_permission

bp = Blueprint('schools', __name__, url_prefix='/api/schools')

@bp.route('/public', methods=['GET'])
def get_public_schools():
    """
    Public endpoint to get all schools without requiring authentication.
    This is needed for the registration form.
    """
    try:
        schools = School.query.all()
        return jsonify({
            'schools': [school.to_dict() for school in schools]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch schools'}), 500

@bp.route('', methods=['POST'])
@jwt_required()
def create_school():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user has permission to create schools
    if not check_permission(user, 'manage_schools'):
        return jsonify({'error': 'You do not have permission to create schools'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('name'):
        return jsonify({'error': 'School name is required'}), 400
    
    # Check if school with same name already exists
    existing_school = School.query.filter_by(name=data['name']).first()
    if existing_school:
        return jsonify({'error': 'A school with this name already exists'}), 400
    
    try:
        # Create new school
        school = School(
            name=data['name'],
            description=data.get('description', ''),
            address=data.get('address', '')
        )
        
        db.session.add(school)
        db.session.commit()
        
        return jsonify({
            'message': 'School created successfully',
            'school': school.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create school'}), 500

@bp.route('', methods=['GET'])
@jwt_required()
def get_schools():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    try:
        if user.role == 'super_admin':
            # Super admin can see all schools
            schools = School.query.all()
        elif user.role == 'school_admin':
            # School admin can only see their school
            schools = [user.school] if user.school else []
        else:
            # Other roles can only see their school
            schools = [user.school] if user.school else []
        
        return jsonify({
            'schools': [school.to_dict() for school in schools]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch schools'}), 500

@bp.route('/<int:school_id>', methods=['GET'])
@jwt_required()
def get_school(school_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    try:
        school = School.query.get_or_404(school_id)
        
        # Check if user has permission to view this school
        if user.role != 'super_admin' and (not user.school or user.school.id != school_id):
            return jsonify({'error': 'You do not have permission to view this school'}), 403
        
        return jsonify(school.to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch school'}), 500

@bp.route('/<int:school_id>', methods=['PUT'])
@jwt_required()
def update_school(school_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user has permission to update schools
    if not check_permission(user, 'manage_schools'):
        return jsonify({'error': 'You do not have permission to update schools'}), 403
    
    try:
        school = School.query.get_or_404(school_id)
        data = request.get_json()
        
        # Check if trying to update to a name that already exists
        if 'name' in data and data['name'] != school.name:
            existing_school = School.query.filter_by(name=data['name']).first()
            if existing_school:
                return jsonify({'error': 'A school with this name already exists'}), 400
        
        if 'name' in data:
            school.name = data['name']
        if 'description' in data:
            school.description = data['description']
        if 'address' in data:
            school.address = data['address']
        
        db.session.commit()
        
        return jsonify({
            'message': 'School updated successfully',
            'school': school.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update school'}), 500

@bp.route('/<int:school_id>', methods=['DELETE'])
@jwt_required()
def delete_school(school_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check if user has permission to delete schools
    if not check_permission(user, 'manage_schools'):
        return jsonify({'error': 'You do not have permission to delete schools'}), 403
    
    try:
        school = School.query.get_or_404(school_id)
        
        # Check if school has any users
        if User.query.filter_by(school_id=school_id).first():
            return jsonify({'error': 'Cannot delete school with existing users'}), 400
        
        db.session.delete(school)
        db.session.commit()
        
        return jsonify({'message': 'School deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete school'}), 500 