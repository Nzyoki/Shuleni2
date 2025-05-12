# Shuleni2 - School Management System

A comprehensive school management platform for managing schools, classes, students, and educational resources.

## Project Structure

The project consists of two main parts:
- **Backend**: Flask API server (Python)
- **Frontend**: React application (JavaScript)

## Prerequisites

- Python 3.8+
- Node.js 14+ and npm
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Shuleni2.git
cd Shuleni2
```

### 2. Backend Setup

```bash
cd shuleni/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize the database
python create_tables.py
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Running the Application

#### Option 1: Run Backend and Frontend Separately

**Backend**:
```bash
cd shuleni/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
export FLASK_APP=app:create_app
flask run
```

**Frontend**:
```bash
cd shuleni/frontend
npm start
```

#### Option 2: Run Both Together (using the provided script)

```bash
cd shuleni
python run.py
```

## Important Notes

1. **Database Configuration**: 
   - The application uses SQLite by default (no additional setup required)
   - To use PostgreSQL instead, set the `DATABASE_URL` environment variable:
     ```bash
     export DATABASE_URL=postgresql://username:password@localhost/dbname
     ```

2. **Demo Data**:
   - When you run `python create_tables.py`, a demo school is created automatically
   - To add more test data, login as a super admin and create schools through the UI

3. **User Registration**:
   - To set up your first user, register as a super_admin
   - Once logged in as super_admin, you can create schools
   - Other users (school_admin, teacher, student) can then register and select a school

## Common Issues and Solutions

1. **Database Errors**:
   - If you see "relation does not exist" errors, run `python create_tables.py` again
   - For SQLite file permission issues, check your directory permissions

2. **CORS Issues**:
   - The backend is configured to accept requests from localhost:3000 and localhost:3003
   - If using different ports, update the CORS settings in `backend/app/__init__.py`

3. **Registration Issues**:
   - Super admin users can register without a school
   - All other roles (school_admin, teacher, student) require a school selection

## API Documentation

The backend provides the following main endpoints:

- **Authentication**: `/api/auth/*` (register, login, get current user)
- **Schools**: `/api/schools/*` (CRUD operations for schools)
- **Classes**: `/api/classes/*` (CRUD operations for classes)
- **Users**: `/api/users/*` (CRUD operations for users)
- **Resources**: `/api/resources/*` (CRUD operations for resources)

## License

[Add your license information here] 