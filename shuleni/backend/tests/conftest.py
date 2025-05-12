import pytest
import os
from app import create_app, db
from app.models import User, School

@pytest.fixture(scope='function')
def app():
    # Ensure we're using SQLite for tests
    test_config = {
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SECRET_KEY': 'test-key',
        'JWT_SECRET_KEY': 'test-jwt-key',
        'MIGRATIONS_ENABLED': False  # Disable migrations during tests
    }
    
    app = create_app(test_config)
    
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
    
    # Create an admin user
    admin = User(
        email='admin@example.com',
        first_name='Admin',
        last_name='User',
        role='admin',
        school_id=school.id
    )
    admin.set_password('password123')
    db.session.add(admin)
    db.session.commit()
    
    # Login and get token
    response = client.post('/api/auth/login', json={
        'email': 'admin@example.com',
        'password': 'password123'
    })
    token = response.get_json()['access_token']
    
    return {'Authorization': f'Bearer {token}'} 