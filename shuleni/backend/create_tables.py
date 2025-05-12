from app import create_app, db
from app.models import School
import traceback
import os
from sqlalchemy import inspect

def check_tables():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tables in database: {tables}")
    if 'user' in tables:
        columns = inspector.get_columns('user')
        print("User table columns:")
        for column in columns:
            print(f"  {column['name']}: nullable={column['nullable']}")

def init_db():
    try:
        app = create_app()
        with app.app_context():
            print(f"Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
            db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
            if db_path.startswith('/'):
                print(f"Database path: {db_path}")
            else:
                full_path = os.path.join(os.getcwd(), db_path)
                print(f"Database path: {full_path}")
                
            # Drop all tables first to ensure a clean slate
            print("Dropping all tables...")
            db.drop_all()
            print("All tables dropped")
            
            # Create all tables fresh
            print("Creating all tables...")
            db.create_all()
            print("All tables created")
            
            # Check what tables were created
            check_tables()
            
            # Add seed data - create a default school if none exists
            if School.query.count() == 0:
                school = School(
                    name="Demo School",
                    description="A demonstration school for testing",
                    address="123 Education Street, Example City"
                )
                db.session.add(school)
                db.session.commit()
                print("Added demo school with id:", school.id)
            
            print("Database tables created successfully!")
            
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    init_db() 