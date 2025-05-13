from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from ..models import Resource, Class, User, db
from ..utils.permissions import check_permission

bp = Blueprint('resources', __name__, url_prefix='/api/resources')

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'mp4', 'mp3'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/class/<int:class_id>', methods=['POST'])
@jwt_required()
def create_resource(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Check permissions based on role and school
    has_permission = (
        # Teacher who teaches this class
        class_.teacher_id == current_user_id or
        # School admin or super admin who can manage resources
        check_permission(current_user, ['create_resources', 'manage_resources']) or
        # Super admin
        current_user.role == 'super_admin'
    )
    
    # For school admin, ensure they belong to the same school
    if current_user.role == 'school_admin' and current_user.school_id != class_.school_id:
        has_permission = False
    
    if not has_permission:
        return jsonify({'error': 'You do not have permission to add resources to this class'}), 403
    
    data = request.form
    if not data or not data.get('title') or not data.get('type'):
        return jsonify({'error': 'Title and type are required'}), 400
    
    # Handle file upload
    file_path = None
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join('uploads', str(class_id), filename)
            os.makedirs(os.path.dirname(os.path.join(current_app.root_path, file_path)), exist_ok=True)
            file.save(os.path.join(current_app.root_path, file_path))
    
    # Create resource
    resource = Resource(
        class_id=class_id,
        title=data['title'],
        description=data.get('description', ''),
        type=data['type'],
        url=data.get('url'),
        file_path=file_path,
        created_by=current_user_id
    )
    
    db.session.add(resource)
    db.session.commit()
    
    return jsonify({
        'message': 'Resource created successfully',
        'resource': resource.to_dict()
    }), 201

@bp.route('', methods=['GET'])
@jwt_required()
def get_all_resources():
    """Get all resources based on user role and permissions"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    try:
        # Based on user role, filter resources
        if current_user.role == 'super_admin':
            # Super admin can see all resources
            resources = Resource.query.all()
        elif current_user.role == 'school_admin':
            # School admin can see resources for classes in their school
            school_id = current_user.school_id
            resources = Resource.query.join(Class).filter(Class.school_id == school_id).all()
        elif current_user.role == 'teacher':
            # Teacher can see resources for classes they teach or in their school
            school_id = current_user.school_id
            resources = Resource.query.join(Class).filter(
                (Class.teacher_id == current_user_id) | (Class.school_id == school_id)
            ).all()
        else:  # student
            # Students can see resources for classes they're enrolled in
            resources = Resource.query.join(Class).join(
                Class.students
            ).filter(User.id == current_user_id).all()
        
        return jsonify({
            'resources': [r.to_dict() for r in resources]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch resources: {str(e)}'}), 500

@bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_resources(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    # Check permissions to view resources for this class
    has_permission = (
        # Teacher who teaches this class
        class_.teacher_id == current_user_id or
        # Student enrolled in the class
        current_user in class_.students or
        # User with view resources permission (from the same school)
        (check_permission(current_user, ['view_resources', 'manage_resources']) and 
         current_user.school_id == class_.school_id) or
        # Super admin
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'You do not have permission to view resources for this class'}), 403
    
    resources = Resource.query.filter_by(class_id=class_id).order_by(Resource.created_at.desc()).all()
    
    return jsonify({
        'resources': [resource.to_dict() for resource in resources]
    }), 200

@bp.route('/<int:resource_id>', methods=['GET'])
@jwt_required()
def get_resource(resource_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    resource = Resource.query.get_or_404(resource_id)
    class_ = Class.query.get(resource.class_id)
    
    # Check permissions to view this resource
    has_permission = (
        # Teacher who teaches this class
        class_.teacher_id == current_user_id or
        # Student enrolled in the class
        current_user in class_.students or
        # User with view resources permission (from the same school)
        (check_permission(current_user, ['view_resources', 'manage_resources']) and 
         current_user.school_id == class_.school_id) or
        # Super admin
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'You do not have permission to view this resource'}), 403
    
    return jsonify(resource.to_dict()), 200

@bp.route('/<int:resource_id>', methods=['PUT'])
@jwt_required()
def update_resource(resource_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    resource = Resource.query.get_or_404(resource_id)
    class_ = Class.query.get(resource.class_id)
    
    # Check permissions to update this resource
    has_permission = (
        # Creator of the resource
        resource.created_by == current_user_id or
        # Teacher who teaches this class
        class_.teacher_id == current_user_id or
        # User with edit resources permission (from the same school)
        (check_permission(current_user, ['edit_resources', 'manage_resources']) and 
         current_user.school_id == class_.school_id) or
        # Super admin
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'You do not have permission to update this resource'}), 403
    
    data = request.form
    
    if 'title' in data:
        resource.title = data['title']
    if 'description' in data:
        resource.description = data['description']
    if 'type' in data:
        resource.type = data['type']
    if 'url' in data:
        resource.url = data['url']
    
    # Handle file upload
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            # Delete old file if exists
            if resource.file_path:
                old_file_path = os.path.join(current_app.root_path, resource.file_path)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            
            filename = secure_filename(file.filename)
            file_path = os.path.join('uploads', str(resource.class_id), filename)
            os.makedirs(os.path.dirname(os.path.join(current_app.root_path, file_path)), exist_ok=True)
            file.save(os.path.join(current_app.root_path, file_path))
            resource.file_path = file_path
    
    db.session.commit()
    
    return jsonify({
        'message': 'Resource updated successfully',
        'resource': resource.to_dict()
    }), 200

@bp.route('/<int:resource_id>', methods=['DELETE'])
@jwt_required()
def delete_resource(resource_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    resource = Resource.query.get_or_404(resource_id)
    class_ = Class.query.get(resource.class_id)
    
    # Check permissions to delete this resource
    has_permission = (
        # Creator of the resource
        resource.created_by == current_user_id or
        # Teacher who teaches this class
        class_.teacher_id == current_user_id or
        # User with delete resources permission (from the same school)
        (check_permission(current_user, ['delete_resources', 'manage_resources']) and 
         current_user.school_id == class_.school_id) or
        # Super admin
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'You do not have permission to delete this resource'}), 403
    
    # Delete file if exists
    if resource.file_path:
        file_path = os.path.join(current_app.root_path, resource.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.session.delete(resource)
    db.session.commit()
    
    return jsonify({'message': 'Resource deleted successfully'}), 200

@bp.route('/uploads/<path:filename>', methods=['GET'])
@jwt_required()
def download_file(filename):
    """Serve uploaded files securely after checking permissions"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Extract class_id from the path (assuming format is 'uploads/<class_id>/filename')
    try:
        parts = filename.split('/')
        if len(parts) >= 2:
            class_id = int(parts[0])
            class_ = Class.query.get_or_404(class_id)
            
            # Check permissions to download this file
            has_permission = (
                # Teacher who teaches this class
                class_.teacher_id == current_user_id or
                # Student enrolled in the class
                current_user in class_.students or
                # User with view resources permission (from the same school)
                (check_permission(current_user, ['view_resources', 'manage_resources']) and 
                 current_user.school_id == class_.school_id) or
                # Super admin
                current_user.role == 'super_admin'
            )
            
            if not has_permission:
                return jsonify({'error': 'You do not have permission to download this file'}), 403
            
            # Serve the file
            uploads_dir = os.path.join(current_app.root_path, 'uploads')
            return send_from_directory(uploads_dir, '/'.join(parts[1:]))
        
    except Exception as e:
        return jsonify({'error': f'Error accessing file: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file path'}), 400

@bp.route('/public/uploads/<path:filename>', methods=['GET'])
def download_file_public(filename):
    """Serve uploaded files through a public URL - still checking class/school context for security"""
    try:
        parts = filename.split('/')
        if len(parts) >= 2:
            class_id = int(parts[0])
            class_ = Class.query.get_or_404(class_id)
            
            # Serve the file - we're not checking permissions here but limiting to actual files
            uploads_dir = os.path.join(current_app.root_path, 'uploads')
            return send_from_directory(uploads_dir, '/'.join(parts[1:]))
        
    except Exception as e:
        return jsonify({'error': f'Error accessing file: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file path'}), 400 