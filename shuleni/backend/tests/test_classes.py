import pytest
from app import db
from app.models import User, School, Class

@pytest.fixture
def test_school(app):
    school = School(name='Test School', description='Test Description')
    db.session.add(school)
    db.session.commit()
    return school

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(app, client):
    # Create a test school
    school = School(name='Test School', description='Test Description')
    db.session.add(school)
    db.session.commit()
    
    # Create a teacher user
    teacher = User(
        email='teacher@example.com',
        first_name='Test',
        last_name='Teacher',
        role='teacher',
        school_id=school.id
    )
    teacher.set_password('password123')
    db.session.add(teacher)
    db.session.commit()
    
    # Login and get token
    response = client.post('/api/auth/login', json={
        'email': 'teacher@example.com',
        'password': 'password123'
    })
    token = response.get_json()['access_token']
    
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def test_student(app, test_school):
    student = User(
        email='student@example.com',
        first_name='Test',
        last_name='Student',
        role='student',
        school_id=test_school.id
    )
    student.set_password('password123')
    db.session.add(student)
    db.session.commit()
    return student

def test_create_class(client, auth_headers, test_school):
    response = client.post('/api/classes', json={
        'name': 'Test Class',
        'description': 'Test Description',
        'school_id': test_school.id
    }, headers=auth_headers)
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Class created successfully'
    assert data['class']['name'] == 'Test Class'

def test_create_class_missing_fields(client, auth_headers):
    response = client.post('/api/classes', json={
        'description': 'Test Description'
    }, headers=auth_headers)
    
    assert response.status_code == 400
    assert response.get_json()['error'] == 'Class name and school ID are required'

def test_get_classes_teacher(client, auth_headers, test_school):
    # Create a class
    class_ = Class(
        name='Test Class',
        description='Test Description',
        school_id=test_school.id,
        teacher_id=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(class_)
    db.session.commit()
    
    response = client.get('/api/classes', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['classes']) == 1
    assert data['classes'][0]['name'] == 'Test Class'

def test_get_class(client, auth_headers, test_school):
    # Create a class
    class_ = Class(
        name='Test Class',
        description='Test Description',
        school_id=test_school.id,
        teacher_id=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(class_)
    db.session.commit()
    
    response = client.get(f'/api/classes/{class_.id}', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['name'] == 'Test Class'

def test_update_class(client, auth_headers, test_school):
    # Create a class
    class_ = Class(
        name='Test Class',
        description='Test Description',
        school_id=test_school.id,
        teacher_id=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(class_)
    db.session.commit()
    
    response = client.put(f'/api/classes/{class_.id}', json={
        'name': 'Updated Class',
        'description': 'Updated Description'
    }, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Class updated successfully'
    assert data['class']['name'] == 'Updated Class'

def test_delete_class(client, auth_headers, test_school):
    # Create a class
    class_ = Class(
        name='Test Class',
        description='Test Description',
        school_id=test_school.id,
        teacher_id=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(class_)
    db.session.commit()
    
    response = client.delete(f'/api/classes/{class_.id}', headers=auth_headers)
    assert response.status_code == 200
    assert response.get_json()['message'] == 'Class deleted successfully'

def test_add_student_to_class(client, auth_headers, test_school, test_student):
    # Create a class
    class_ = Class(
        name='Test Class',
        description='Test Description',
        school_id=test_school.id,
        teacher_id=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(class_)
    db.session.commit()
    
    response = client.post(f'/api/classes/{class_.id}/students', json={
        'student_id': test_student.id
    }, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Student added to class successfully'
    assert len(data['class']['students']) == 1

def test_remove_student_from_class(client, auth_headers, test_school, test_student):
    # Create a class
    class_ = Class(
        name='Test Class',
        description='Test Description',
        school_id=test_school.id,
        teacher_id=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(class_)
    db.session.commit()
    
    # Add student to class
    class_.students.append(test_student)
    db.session.commit()
    
    response = client.delete(
        f'/api/classes/{class_.id}/students/{test_student.id}',
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Student removed from class successfully'
    assert len(data['class']['students']) == 0 