from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify
from ..models.user import User

def has_permission(required_permission):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            if required_permission in user.permissions:
                return f(*args, **kwargs)
            
            return jsonify({'error': 'Permission denied'}), 403
            
        return decorated_function
    return decorator 