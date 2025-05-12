import os
import sys
import subprocess
import multiprocessing
import time
from pathlib import Path

def run_backend():
    os.chdir('shuleni/backend')
    if sys.platform == 'win32':
        subprocess.run(['python', 'wsgi.py'], check=True)
    else:
        subprocess.run(['python3', 'wsgi.py'], check=True)

def run_frontend():
    os.chdir('shuleni/frontend')
    if sys.platform == 'win32':
        subprocess.run(['npm', 'start'], check=True)
    else:
        subprocess.run(['npm', 'start'], check=True)

def main():
    # Get the absolute path to the project root
    project_root = Path(__file__).parent.absolute()
    os.chdir(project_root)

    # Create processes for backend and frontend
    backend_process = multiprocessing.Process(target=run_backend)
    frontend_process = multiprocessing.Process(target=run_frontend)

    try:
        print("Starting backend server...")
        backend_process.start()
        time.sleep(2)  # Give backend time to start

        print("Starting frontend server...")
        frontend_process.start()

        # Keep the main process running
        backend_process.join()
        frontend_process.join()

    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.join()
        frontend_process.join()
        print("Servers stopped.")

if __name__ == '__main__':
    main() 