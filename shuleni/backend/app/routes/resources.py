from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from ..models import Resource, Class, User, db

bp = Blueprint('resources', __name__, url_prefix='/api/resources')

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'mp4', 'mp3'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/class/<int:class_id>', methods=['POST'])
@jwt_required()
def create_resource(class_id):
    current_user_id = get_jwt_identity()
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user is the teacher of this class
    if class_.teacher_id != current_user_id:
        return jsonify({'error': 'Only the class teacher can add resources'}), 403
    
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

@bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_resources(class_id):
    current_user_id = get_jwt_identity()
    class_ = Class.query.get_or_404(class_id)
    
    # Check if user is the teacher or a student in the class
    if class_.teacher_id != current_user_id:
        user = User.query.get(current_user_id)
        if user not in class_.students:
            return jsonify({'error': 'Unauthorized access'}), 403
    
    resources = Resource.query.filter_by(class_id=class_id).order_by(Resource.created_at.desc()).all()
    
    return jsonify({
        'resources': [resource.to_dict() for resource in resources]
    }), 200

@bp.route('/<int:resource_id>', methods=['GET'])
@jwt_required()
def get_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    class_ = Class.query.get(resource.class_id)
    
    # Check if user is the teacher or a student in the class
    current_user_id = get_jwt_identity()
    if class_.teacher_id != current_user_id:
        user = User.query.get(current_user_id)
        if user not in class_.students:
            return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify(resource.to_dict()), 200

@bp.route('/<int:resource_id>', methods=['PUT'])
@jwt_required()
def update_resource(resource_id):
    current_user_id = get_jwt_identity()
    resource = Resource.query.get_or_404(resource_id)
    
    # Check if user is the creator of the resource
    if resource.created_by != current_user_id:
        return jsonify({'error': 'Only the resource creator can update it'}), 403
    
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
    resource = Resource.query.get_or_404(resource_id)
    
    # Check if user is the creator of the resource
    if resource.created_by != current_user_id:
        return jsonify({'error': 'Only the resource creator can delete it'}), 403
    
    # Delete file if exists
    if resource.file_path:
        file_path = os.path.join(current_app.root_path, resource.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.session.delete(resource)
    db.session.commit()
    
    return jsonify({'message': 'Resource deleted successfully'}), 200 