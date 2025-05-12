import subprocess
import os

# Get the current directory where run.py is located
base_dir = os.path.dirname(os.path.abspath(__file__))

backend_dir = os.path.join(base_dir, "backend")
frontend_dir = os.path.join(base_dir, "frontend")

backend = subprocess.Popen(
    ["flask", "run", "--port=5000", "--host=0.0.0.0"],
    cwd=backend_dir,
    env={**os.environ, "FLASK_APP": "app:create_app()"}
)

frontend = subprocess.Popen(
    ["npm", "start"],
    cwd=frontend_dir
)

try:
    backend.wait()
    frontend.wait()
except KeyboardInterrupt:
    backend.terminate()
    frontend.terminate()