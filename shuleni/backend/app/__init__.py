from flask import Flask, request
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
    
    # Get the absolute path to the current directory
    basedir = os.path.abspath(os.path.dirname(__file__))
    instance_path = os.path.join(os.path.dirname(basedir), 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
    
    db_path = os.path.join(instance_path, 'shuleni.db')
    
    # Default configuration
    app.config['SECRET_KEY'] = 'dev'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
    
    if test_config is None:
        # Load environment variables only in non-test mode
        load_dotenv()
        # Override with environment variables if they exist - except DATABASE_URL
        app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', app.config['SECRET_KEY'])
        
        # Force SQLite for now - explicitly ignore DATABASE_URL if it contains 'postgresql'
        db_url = os.getenv('DATABASE_URL', '')
        if not db_url or 'postgresql' in db_url:
            # Use SQLite with absolute path
            app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
        else:
            app.config['SQLALCHEMY_DATABASE_URI'] = db_url
            
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['JWT_SECRET_KEY'])
    else:
        # Override config with test settings
        app.config.update(test_config)
    
    app.logger.info(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS with proper settings
    CORS(app, 
         resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Initialize SocketIO with CORS settings
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Register blueprints
    from .routes.auth import bp as auth_bp
    from .routes.schools import bp as schools_bp
    from .routes.classes import bp as classes_bp
    from .routes.attendance import bp as attendance_bp
    from .routes.resources import bp as resources_bp
    from .routes.assessments import bp as assessments_bp
    from .routes.users import bp as users_bp
    from .routes.reports import bp as reports_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(schools_bp)
    app.register_blueprint(classes_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(assessments_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(reports_bp)
    
    return app