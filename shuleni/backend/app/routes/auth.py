from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from datetime import timedelta
from ..models.user import User
from ..models.school import School
from .. import db

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Backend server is running'
    }), 200

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password', 'first_name', 'last_name', 'role']):
        return jsonify({'error': 'Missing required fields'}), 400
        
    if data['role'] not in ['super_admin', 'school_admin', 'teacher', 'student']:
        return jsonify({'error': 'Invalid role'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    if data['role'] == 'super_admin':
        school_id = None
    else:
        if 'school_id' not in data:
            return jsonify({'error': 'School ID is required for this role'}), 400
            
        school = School.query.get(data['school_id'])
        if not school:
            return jsonify({'error': 'School not found'}), 404
            
        school_id = data['school_id']
        
    user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data['role'],
        school_id=school_id
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
        
    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 401
        
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
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify(user.to_dict()), 200 