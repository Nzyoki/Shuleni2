import pytest
from app import create_app, db
from app.models import User, School, Class, Attendance
from datetime import datetime, date

@pytest.fixture
def app():
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SECRET_KEY': 'test-key',
        'JWT_SECRET_KEY': 'test-jwt-key'
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

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

@pytest.fixture
def test_student(app):
    school = School.query.first()
    student = User(
        email='student@example.com',
        first_name='Test',
        last_name='Student',
        role='student',
        school_id=school.id
    )
    student.set_password('password123')
    db.session.add(student)
    db.session.commit()
    return student

def test_mark_attendance(client, auth_headers, test_class, test_student):
    # Add student to class
    test_class.students.append(test_student)
    db.session.commit()
    
    response = client.post(f'/api/attendance/class/{test_class.id}', json={
        'date': '2024-03-20',
        'attendance_records': [
            {
                'student_id': test_student.id,
                'status': 'present',
                'notes': 'On time'
            }
        ]
    }, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Attendance marked successfully'
    assert data['date'] == '2024-03-20'

def test_mark_attendance_unauthorized(client, auth_headers, test_class):
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
    
    response = client.post(f'/api/attendance/class/{test_class.id}', json={
        'date': '2024-03-20',
        'attendance_records': []
    }, headers=headers)
    
    assert response.status_code == 403
    assert response.get_json()['error'] == 'Only the class teacher can mark attendance'

def test_get_attendance(client, auth_headers, test_class, test_student):
    # Add student to class
    test_class.students.append(test_student)
    db.session.commit()
    
    # Mark attendance first
    attendance = Attendance(
        class_id=test_class.id,
        student_id=test_student.id,
        date=date(2024, 3, 20),
        status='present',
        notes='On time'
    )
    db.session.add(attendance)
    db.session.commit()
    
    response = client.get(f'/api/attendance/class/{test_class.id}/date/2024-03-20', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['date'] == '2024-03-20'
    assert len(data['attendance']) == 1
    assert data['attendance'][0]['status'] == 'present'

def test_get_student_attendance(client, auth_headers, test_class, test_student):
    # Add student to class
    test_class.students.append(test_student)
    db.session.commit()
    
    # Mark attendance first
    attendance = Attendance(
        class_id=test_class.id,
        student_id=test_student.id,
        date=date(2024, 3, 20),
        status='present',
        notes='On time'
    )
    db.session.add(attendance)
    db.session.commit()
    
    response = client.get(f'/api/attendance/student/{test_student.id}/class/{test_class.id}', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['student_id'] == test_student.id
    assert data['class_id'] == test_class.id
    assert len(data['attendance']) == 1
    assert data['attendance'][0]['status'] == 'present' 