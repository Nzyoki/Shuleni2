from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.school import School
from ..models.user import User
from .. import db
from ..utils.decorators import has_permission

bp = Blueprint('schools', __name__, url_prefix='/api/schools')

@bp.route('/public', methods=['GET'])
def get_public_schools():
    """
    Public endpoint to get all schools without requiring authentication.
    This is needed for the registration form.
    """
    schools = School.query.all()
    return jsonify([school.to_dict() for school in schools]), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_school():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user.has_permission('manage_schools'):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    existing_school = School.query.filter_by(name=data['name']).first()
    if existing_school:
        return jsonify({'error': 'School with this name already exists'}), 400
    
        school = School(
            name=data['name'],
        address=data.get('address', ''),
        phone=data.get('phone', ''),
        email=data.get('email', '')
        )
        
        db.session.add(school)
        db.session.commit()
        
    return jsonify(school.to_dict()), 201

@bp.route('', methods=['GET'])
@jwt_required()
def get_schools():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role == 'super_admin':
            schools = School.query.all()
    elif current_user.role == 'school_admin':
        schools = [School.query.get(current_user.school_id)]
        else:
        schools = [School.query.get(current_user.school_id)]
        
    return jsonify([school.to_dict() for school in schools if school]), 200

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_school(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user.has_permission('manage_schools') and current_user.school_id != id:
        return jsonify({'error': 'Permission denied'}), 403
        
    school = School.query.get_or_404(id)
        return jsonify(school.to_dict()), 200

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_school(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user.has_permission('manage_schools'):
        return jsonify({'error': 'Permission denied'}), 403
    
    school = School.query.get_or_404(id)
        data = request.get_json()
        
    if data.get('name') and data['name'] != school.name:
            existing_school = School.query.filter_by(name=data['name']).first()
            if existing_school:
            return jsonify({'error': 'School with this name already exists'}), 400
            school.name = data['name']
        
    if data.get('address'):
            school.address = data['address']
    if data.get('phone'):
        school.phone = data['phone']
    if data.get('email'):
        school.email = data['email']
        
        db.session.commit()
        
    return jsonify(school.to_dict()), 200

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_school(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user.has_permission('manage_schools'):
        return jsonify({'error': 'Permission denied'}), 403
    
    school = School.query.get_or_404(id)
        
    if school.users:
        return jsonify({'error': 'Cannot delete school with active users'}), 400
        
        db.session.delete(school)
        db.session.commit()
        
    return '', 204 