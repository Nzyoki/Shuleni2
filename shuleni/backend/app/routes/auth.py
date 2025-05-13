from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import User, School, db
from datetime import timedelta
import traceback

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Backend server is running'
    }), 200

@bp.route('/register', methods=['POST'])
def register():
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        current_app.logger.info(f"Register request data: {data}")
        
        if data is None:
            return jsonify({'error': 'Invalid JSON in request body'}), 400
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate role
        valid_roles = ['super_admin', 'school_admin', 'teacher', 'student']
        if data['role'] not in valid_roles:
            return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Role-specific validation
        school_id = None
        if data['role'] == 'super_admin':
            # Super admin doesn't need a school
            current_app.logger.info("Registering super_admin with school_id=None")
            school_id = None
        else:
            # All other roles require a school
            if 'school_id' not in data or not data['school_id']:
                return jsonify({'error': 'School ID is required for this role'}), 400
            
            # Check if school exists
            school_id = data['school_id']
            school = School.query.get(school_id)
            if not school:
                return jsonify({'error': 'School not found'}), 404
                
            current_app.logger.info(f"Registering {data['role']} with school_id={school_id}")
        
        # Create new user
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role'],
            school_id=school_id
        )
        user.set_password(data['password'])
            
        # Log the user object before attempting to save
        current_app.logger.info(f"User object before save: email={user.email}, role={user.role}, school_id={user.school_id}")
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        current_app.logger.error(f"Registration error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200 