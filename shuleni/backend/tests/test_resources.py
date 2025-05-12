import pytest
from app import db
from app.models import User, School, Class, Resource
from datetime import datetime
import os

@pytest.fixture
def test_class(app, auth_headers):
    school = School.query.first()
    class_ = Class(
        name='Test Class',
        description='Test Description',
        school_id=school.id,
        teacher_id=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(class_)
    db.session.commit()
    return class_

def test_create_resource(client, auth_headers, test_class):
    response = client.post(f'/api/resources/class/{test_class.id}', 
        data={
            'title': 'Test Resource',
            'description': 'Test Description',
            'type': 'document',
            'url': 'https://example.com'
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Resource created successfully'
    assert data['resource']['title'] == 'Test Resource'
    assert data['resource']['type'] == 'document'

def test_create_resource_unauthorized(client, auth_headers, test_class):
    # Create another teacher
    school = School.query.first()
    other_teacher = User(
        email='other@example.com',
        first_name='Other',
        last_name='Teacher',
        role='teacher',
        school_id=school.id
    )
    other_teacher.set_password('password123')
    db.session.add(other_teacher)
    db.session.commit()
    
    # Login as other teacher
    response = client.post('/api/auth/login', json={
        'email': 'other@example.com',
        'password': 'password123'
    })
    token = response.get_json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    response = client.post(f'/api/resources/class/{test_class.id}', 
        data={
            'title': 'Test Resource',
            'type': 'document'
        },
        headers=headers
    )
    
    assert response.status_code == 403
    assert response.get_json()['error'] == 'Only the class teacher can add resources'

def test_get_class_resources(client, auth_headers, test_class):
    # Create a resource first
    resource = Resource(
        class_id=test_class.id,
        title='Test Resource',
        description='Test Description',
        type='document',
        url='https://example.com',
        created_by=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(resource)
    db.session.commit()
    
    response = client.get(f'/api/resources/class/{test_class.id}', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['resources']) == 1
    assert data['resources'][0]['title'] == 'Test Resource'

def test_get_resource(client, auth_headers, test_class):
    # Create a resource first
    resource = Resource(
        class_id=test_class.id,
        title='Test Resource',
        description='Test Description',
        type='document',
        url='https://example.com',
        created_by=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(resource)
    db.session.commit()
    
    response = client.get(f'/api/resources/{resource.id}', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['title'] == 'Test Resource'
    assert data['type'] == 'document'

def test_update_resource(client, auth_headers, test_class):
    # Create a resource first
    resource = Resource(
        class_id=test_class.id,
        title='Test Resource',
        description='Test Description',
        type='document',
        url='https://example.com',
        created_by=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(resource)
    db.session.commit()
    
    response = client.put(f'/api/resources/{resource.id}', 
        data={
            'title': 'Updated Resource',
            'description': 'Updated Description'
        },
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Resource updated successfully'
    assert data['resource']['title'] == 'Updated Resource'

def test_delete_resource(client, auth_headers, test_class):
    # Create a resource first
    resource = Resource(
        class_id=test_class.id,
        title='Test Resource',
        description='Test Description',
        type='document',
        url='https://example.com',
        created_by=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(resource)
    db.session.commit()
    
    response = client.delete(f'/api/resources/{resource.id}', headers=auth_headers)
    
    assert response.status_code == 200
    assert response.get_json()['message'] == 'Resource deleted successfully'
    
    # Verify resource is deleted
    deleted_resource = Resource.query.get(resource.id)
    assert deleted_resource is None 