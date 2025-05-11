import pytest
from app import db
from app.models import User, School

def test_create_school(client, auth_headers):
    response = client.post('/api/schools', json={
        'name': 'New School',
        'description': 'A new school',
        'address': '123 Test St'
    }, headers=auth_headers)
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'School created successfully'
    assert data['school']['name'] == 'New School'

def test_create_school_missing_name(client, auth_headers):
    response = client.post('/api/schools', json={
        'description': 'A new school'
    }, headers=auth_headers)
    
    assert response.status_code == 400
    assert response.get_json()['error'] == 'School name is required'

def test_get_schools(client, auth_headers):
    # The auth_headers fixture already creates one school
    response = client.get('/api/schools', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['schools']) == 1
    assert data['schools'][0]['name'] == 'Test School'

def test_get_school(client, auth_headers):
    # Create a test school
    school = School(name='Test School', description='Test Description')
    db.session.add(school)
    db.session.commit()
    
    response = client.get(f'/api/schools/{school.id}', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['name'] == 'Test School'

def test_update_school(client, auth_headers):
    # Create a test school
    school = School(name='Test School', description='Test Description')
    db.session.add(school)
    db.session.commit()
    
    response = client.put(f'/api/schools/{school.id}', json={
        'name': 'Updated School',
        'description': 'Updated Description'
    }, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'School updated successfully'
    assert data['school']['name'] == 'Updated School'

def test_delete_school(client, auth_headers):
    # Create a test school
    school = School(name='Test School', description='Test Description')
    db.session.add(school)
    db.session.commit()
    
    response = client.delete(f'/api/schools/{school.id}', headers=auth_headers)
    assert response.status_code == 200
    assert response.get_json()['message'] == 'School deleted successfully'

def test_delete_school_with_users(client, auth_headers):
    # Create a test school
    school = School(name='Test School', description='Test Description')
    db.session.add(school)
    db.session.commit()
    
    # Create a user in the school
    user = User(
        email='test@example.com',
        first_name='Test',
        last_name='User',
        role='teacher',
        school_id=school.id
    )
    user.set_password('password123')
    db.session.add(user)
    db.session.commit()
    
    response = client.delete(f'/api/schools/{school.id}', headers=auth_headers)
    assert response.status_code == 400
    assert response.get_json()['error'] == 'Cannot delete school with existing users' 