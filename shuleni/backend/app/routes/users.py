from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, School, db
from ..utils.permissions import check_permission

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (with optional filtering)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Check permissions - only super_admin or school_admin can list users
    if not check_permission(current_user, ['manage_users', 'manage_all_users']):
        return jsonify({'error': 'You do not have permission to view users'}), 403
    
    try:
        # Get query parameters
        role = request.args.get('role')
        school_id = request.args.get('school_id')
        
        # Base query
        query = User.query
        
        # Apply filters based on role and permissions
        if current_user.role == 'super_admin':
            # Super admin can see all users, with optional filters
            if role:
                query = query.filter(User.role == role)
            if school_id:
                query = query.filter(User.school_id == school_id)
        elif current_user.role == 'school_admin':
            # School admin can only see users from their school
            query = query.filter(User.school_id == current_user.school_id)
            if role:
                query = query.filter(User.role == role)
        else:
            # Other roles shouldn't reach here due to permission check
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Execute query
        users = query.all()
        
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch users: {str(e)}'}), 500

@bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get a specific user by ID"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    try:
        # Users can view their own profile
        if user_id == current_user_id:
            return jsonify(current_user.to_dict()), 200
            
        # Check permissions for viewing other users
        if not check_permission(current_user, ['manage_users', 'manage_all_users']):
            return jsonify({'error': 'You do not have permission to view this user'}), 403
        
        user = User.query.get_or_404(user_id)
        
        # School admins can only view users in their school
        if current_user.role == 'school_admin' and user.school_id != current_user.school_id:
            return jsonify({'error': 'You do not have permission to view this user'}), 403
            
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch user: {str(e)}'}), 500

@bp.route('', methods=['POST'])
@jwt_required()
def create_user():
    """Create a new user (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Check permissions - only admin roles can create users
    if not check_permission(current_user, ['create_users', 'manage_users', 'manage_all_users']):
        return jsonify({'error': 'You do not have permission to create users'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Email validation
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Role validation
    valid_roles = ['super_admin', 'school_admin', 'teacher', 'student']
    if data['role'] not in valid_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
    
    # School validation based on role and permissions
    school_id = data.get('school_id')
    
    # Super admins don't need a school
    if data['role'] == 'super_admin':
        school_id = None
    else:
        # All other roles require a school
        if not school_id:
            return jsonify({'error': 'School ID is required for this role'}), 400
            
        # Check if school exists
        school = School.query.get(school_id)
        if not school:
            return jsonify({'error': 'School not found'}), 404
            
        # School admins can only create users for their own school
        if current_user.role == 'school_admin' and school_id != current_user.school_id:
            return jsonify({'error': 'You can only create users for your school'}), 403
            
        # Super admin can create any user
        if current_user.role != 'super_admin':
            # Non-super admins can't create super admins
            if data['role'] == 'super_admin':
                return jsonify({'error': 'You do not have permission to create super admin users'}), 403
    
    try:
        # Create new user
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role'],
            school_id=school_id,
            is_active=data.get('is_active', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create user: {str(e)}'}), 500

@bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update a user"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Users can update their own profile
    if user_id == current_user_id:
        # Self-update has limited fields
        allowed_self_fields = ['first_name', 'last_name', 'password']
    else:
        # Check permissions for updating other users
        if not check_permission(current_user, ['edit_users', 'manage_users', 'manage_all_users']):
            return jsonify({'error': 'You do not have permission to update this user'}), 403
    
    try:
        user = User.query.get_or_404(user_id)
        
        # School admins can only update users in their school
        if current_user.role == 'school_admin' and user.school_id != current_user.school_id:
            return jsonify({'error': 'You do not have permission to update this user'}), 403
            
        # Non-super admins can't modify super admins
        if user.role == 'super_admin' and current_user.role != 'super_admin':
            return jsonify({'error': 'You do not have permission to update super admin users'}), 403
        
        data = request.get_json()
        
        # Apply updates based on permissions
        if user_id == current_user_id:
            # Self-update
            for field in allowed_self_fields:
                if field in data:
                    if field == 'password':
                        user.set_password(data['password'])
                    else:
                        setattr(user, field, data[field])
        else:
            # Admin update
            updateable_fields = ['first_name', 'last_name', 'email', 'is_active']
            
            # Only super admin can change roles
            if current_user.role == 'super_admin' and 'role' in data:
                user.role = data['role']
                
            # Only super admin can change school
            if current_user.role == 'super_admin' and 'school_id' in data:
                if data['role'] == 'super_admin':
                    user.school_id = None
                else:
                    # Validate school
                    school = School.query.get(data['school_id'])
                    if not school:
                        return jsonify({'error': 'School not found'}), 404
                    user.school_id = data['school_id']
                    
            # Update other fields
            for field in updateable_fields:
                if field in data:
                    setattr(user, field, data[field])
            
            # Handle password separately
            if 'password' in data:
                user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update user: {str(e)}'}), 500

@bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete a user"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Users can't delete themselves
    if user_id == current_user_id:
        return jsonify({'error': 'You cannot delete your own account'}), 400
        
    # Check permissions
    if not check_permission(current_user, ['delete_users', 'manage_users', 'manage_all_users']):
        return jsonify({'error': 'You do not have permission to delete users'}), 403
    
    try:
        user = User.query.get_or_404(user_id)
        
        # School admins can only delete users in their school
        if current_user.role == 'school_admin' and user.school_id != current_user.school_id:
            return jsonify({'error': 'You do not have permission to delete this user'}), 403
            
        # Non-super admins can't delete super admins
        if user.role == 'super_admin' and current_user.role != 'super_admin':
            return jsonify({'error': 'You do not have permission to delete super admin users'}), 403
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete user: {str(e)}'}), 500 