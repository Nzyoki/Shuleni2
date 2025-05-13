from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from ..models import Resource, Class, User, db
from ..utils.permissions import check_permission
from datetime import datetime

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
    
    has_permission = (
        current_user.id == class_.teacher_id or
        (current_user.has_permission('manage_resources') and current_user.school_id == class_.school_id) or
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'Permission denied'}), 403
        
    if current_user.role == 'school_admin' and current_user.school_id != class_.school_id:
        return jsonify({'error': 'Permission denied'}), 403
        
    data = request.form.to_dict()
    file = request.files.get('file')
    
    if file:
        filename = secure_filename(file.filename)
        upload_dir = os.path.join('app', 'uploads', str(class_id))
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(str(class_id), filename)
        file.save(os.path.join('app', 'uploads', file_path))
    else:
        file_path = None
        
    resource = Resource(
        title=data.get('title'),
        description=data.get('description'),
        type=data.get('type'),
        url=data.get('url'),
        file_path=file_path,
        class_id=class_id,
        created_by=current_user_id
    )
    
    db.session.add(resource)
    db.session.commit()
    
    return jsonify(resource.to_dict()), 201

@bp.route('', methods=['GET'])
@jwt_required()
def get_resources():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role == 'super_admin':
        resources = Resource.query.all()
    elif current_user.role == 'school_admin':
        school_classes = Class.query.filter_by(school_id=current_user.school_id).all()
        class_ids = [c.id for c in school_classes]
        resources = Resource.query.filter(Resource.class_id.in_(class_ids)).all()
    elif current_user.role == 'teacher':
        school_classes = Class.query.filter_by(school_id=current_user.school_id).all()
        class_ids = [c.id for c in school_classes]
        resources = Resource.query.filter(Resource.class_id.in_(class_ids)).all()
    else:
        enrolled_classes = current_user.classes_enrolled
        class_ids = [c.id for c in enrolled_classes]
        resources = Resource.query.filter(Resource.class_id.in_(class_ids)).all()
    
    return jsonify([resource.to_dict() for resource in resources]), 200

@bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_resources(class_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    class_ = Class.query.get_or_404(class_id)
    
    has_permission = (
        current_user.id == class_.teacher_id or
        current_user in class_.students or
        (current_user.has_permission('view_resources') and current_user.school_id == class_.school_id) or
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'Permission denied'}), 403
        
    resources = Resource.query.filter_by(class_id=class_id).all()
    return jsonify([resource.to_dict() for resource in resources]), 200

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_resource(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    resource = Resource.query.get_or_404(id)
    class_ = Class.query.get_or_404(resource.class_id)
    
    has_permission = (
        current_user.id == class_.teacher_id or
        current_user in class_.students or
        (current_user.has_permission('view_resources') and current_user.school_id == class_.school_id) or
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'Permission denied'}), 403
        
    return jsonify(resource.to_dict()), 200

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_resource(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    resource = Resource.query.get_or_404(id)
    class_ = Class.query.get_or_404(resource.class_id)
    
    has_permission = (
        current_user.id == resource.created_by or
        current_user.id == class_.teacher_id or
        (current_user.has_permission('manage_resources') and current_user.school_id == class_.school_id) or
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'Permission denied'}), 403
        
    data = request.form.to_dict()
    file = request.files.get('file')
    
    if file:
        filename = secure_filename(file.filename)
        if resource.file_path:
            old_path = os.path.join('app', 'uploads', resource.file_path)
            if os.path.exists(old_path):
                os.remove(old_path)
                
        upload_dir = os.path.join('app', 'uploads', str(class_.id))
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(str(class_.id), filename)
        file.save(os.path.join('app', 'uploads', file_path))
        resource.file_path = file_path
        
    if data.get('title'):
        resource.title = data['title']
    if data.get('description'):
        resource.description = data['description']
    if data.get('type'):
        resource.type = data['type']
    if data.get('url'):
        resource.url = data['url']
        
    resource.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(resource.to_dict()), 200

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_resource(id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    resource = Resource.query.get_or_404(id)
    class_ = Class.query.get_or_404(resource.class_id)
    
    has_permission = (
        current_user.id == resource.created_by or
        current_user.id == class_.teacher_id or
        (current_user.has_permission('manage_resources') and current_user.school_id == class_.school_id) or
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'Permission denied'}), 403
        
    if resource.file_path:
        file_path = os.path.join('app', 'uploads', resource.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
            
    db.session.delete(resource)
    db.session.commit()
    
    return '', 204

@bp.route('/public/<path:file_path>', methods=['GET'])
@jwt_required()
def download_resource(file_path):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    try:
        class_id = int(file_path.split('/')[0])
    except (IndexError, ValueError):
        return jsonify({'error': 'Invalid file path'}), 400
        
    class_ = Class.query.get_or_404(class_id)
    
    has_permission = (
        current_user.id == class_.teacher_id or
        current_user in class_.students or
        (current_user.has_permission('view_resources') and current_user.school_id == class_.school_id) or
        current_user.role == 'super_admin'
    )
    
    if not has_permission:
        return jsonify({'error': 'Permission denied'}), 403
        
    return send_from_directory('app/uploads', file_path)

@bp.route('/public/preview/<path:file_path>', methods=['GET'])
def preview_resource(file_path):
    if not file_path.endswith(('.pdf', '.jpg', '.jpeg', '.png', '.gif')):
        return jsonify({'error': 'File type not supported for preview'}), 400
        
    return send_from_directory('app/uploads', file_path) 