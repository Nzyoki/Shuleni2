from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from datetime import timedelta
import os
from dotenv import load_dotenv

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()

def create_app(test_config=None):
    app = Flask(__name__)
    
    # Default configuration
    app.config['SECRET_KEY'] = 'dev'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shuleni.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
    
    if test_config is None:
        # Load environment variables only in non-test mode
        load_dotenv()
        # Override with environment variables if they exist
        app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', app.config['SECRET_KEY'])
        app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', app.config['SQLALCHEMY_DATABASE_URI'])
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['JWT_SECRET_KEY'])
    else:
        # Override config with test settings
        app.config.update(test_config)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app, cors_allowed_origins=[
        "http://localhost:3000",
        "http://localhost:5001",
        "http://172.19.134.42:3000",
        "http://172.19.134.42:5001"
    ])
    
    # Configure CORS
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://localhost:5001",
                "http://172.19.134.42:3000",
                "http://172.19.134.42:5001"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    from .routes.auth import bp as auth_bp
    from .routes.schools import bp as schools_bp
    from .routes.classes import bp as classes_bp
    from .routes.attendance import bp as attendance_bp
    from .routes.resources import bp as resources_bp
    from .routes.assessments import bp as assessments_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(schools_bp)
    app.register_blueprint(classes_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(assessments_bp)
    
    return app 