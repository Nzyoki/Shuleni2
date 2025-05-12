# Shuleni2 Backend

Flask API server for the Shuleni2 school management system.

## Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file based on `.env.example` (if available)

4. Initialize the database:
   ```bash
   python create_tables.py
   ```

5. Start the server:
   ```bash
   export FLASK_APP=app:create_app
   flask run
   ```

## Database Notes

- SQLite is used by default and stored in `instance/shuleni.db`
- To use PostgreSQL, set the `DATABASE_URL` environment variable
- If you encounter database schema issues, run `python create_tables.py` again to reset the database

## Troubleshooting

If you're experiencing "NOT NULL constraint failed" errors, it's likely because the database schema wasn't correctly updated. Try:

1. Delete the database file: `rm instance/shuleni.db`
2. Recreate it: `python create_tables.py`

For other issues, check the main README.md in the project root. 