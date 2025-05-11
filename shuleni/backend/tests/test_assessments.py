import pytest
from app import db
from app.models import User, School, Class, Assessment, AssessmentSubmission
from datetime import datetime

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

def test_create_assessment(client, auth_headers, test_class):
    response = client.post(f'/api/assessments/class/{test_class.id}', json={
        'title': 'Test Assessment',
        'description': 'Test Description',
        'type': 'quiz',
        'total_points': 100,
        'due_date': '2024-03-25T00:00:00'
    }, headers=auth_headers)
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Assessment created successfully'
    assert data['assessment']['title'] == 'Test Assessment'
    assert data['assessment']['type'] == 'quiz'

def test_create_assessment_unauthorized(client, auth_headers, test_class):
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
    
    response = client.post(f'/api/assessments/class/{test_class.id}', json={
        'title': 'Test Assessment',
        'type': 'quiz',
        'total_points': 100
    }, headers=headers)
    
    assert response.status_code == 403
    assert response.get_json()['error'] == 'Only the class teacher can create assessments'

def test_get_class_assessments(client, auth_headers, test_class):
    # Create an assessment first
    assessment = Assessment(
        class_id=test_class.id,
        title='Test Assessment',
        description='Test Description',
        type='quiz',
        total_points=100,
        due_date=datetime(2024, 3, 25),
        created_by=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(assessment)
    db.session.commit()
    
    response = client.get(f'/api/assessments/class/{test_class.id}', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['assessments']) == 1
    assert data['assessments'][0]['title'] == 'Test Assessment'

def test_submit_assessment(client, auth_headers, test_class, test_student):
    # Add student to class
    test_class.students.append(test_student)
    db.session.commit()
    
    # Create an assessment first
    assessment = Assessment(
        class_id=test_class.id,
        title='Test Assessment',
        description='Test Description',
        type='quiz',
        total_points=100,
        due_date=datetime(2024, 3, 25),
        created_by=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(assessment)
    db.session.commit()
    
    # Login as student
    response = client.post('/api/auth/login', json={
        'email': 'student@example.com',
        'password': 'password123'
    })
    token = response.get_json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    response = client.post(f'/api/assessments/{assessment.id}/submit', json={
        'submission': 'Test submission content'
    }, headers=headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Assessment submitted successfully'
    assert data['submission']['status'] == 'submitted'

def test_grade_submission(client, auth_headers, test_class, test_student):
    # Add student to class
    test_class.students.append(test_student)
    db.session.commit()
    
    # Create an assessment first
    assessment = Assessment(
        class_id=test_class.id,
        title='Test Assessment',
        description='Test Description',
        type='quiz',
        total_points=100,
        due_date=datetime(2024, 3, 25),
        created_by=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(assessment)
    db.session.commit()
    
    # Create a submission
    submission = AssessmentSubmission(
        assessment_id=assessment.id,
        student_id=test_student.id,
        submission='Test submission content',
        status='submitted'
    )
    db.session.add(submission)
    db.session.commit()
    
    response = client.post(f'/api/assessments/{assessment.id}/grade/{submission.id}', json={
        'score': 85,
        'feedback': 'Good work!'
    }, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Submission graded successfully'
    assert data['submission']['score'] == 85
    assert data['submission']['status'] == 'graded'

def test_get_submissions(client, auth_headers, test_class, test_student):
    # Add student to class
    test_class.students.append(test_student)
    db.session.commit()
    
    # Create an assessment first
    assessment = Assessment(
        class_id=test_class.id,
        title='Test Assessment',
        description='Test Description',
        type='quiz',
        total_points=100,
        due_date=datetime(2024, 3, 25),
        created_by=1  # ID of the teacher from auth_headers fixture
    )
    db.session.add(assessment)
    db.session.commit()
    
    # Create a submission
    submission = AssessmentSubmission(
        assessment_id=assessment.id,
        student_id=test_student.id,
        submission='Test submission content',
        status='submitted'
    )
    db.session.add(submission)
    db.session.commit()
    
    response = client.get(f'/api/assessments/{assessment.id}/submissions', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['submissions']) == 1
    assert data['submissions'][0]['status'] == 'submitted' 