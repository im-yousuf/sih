# Installation Guide

## Prerequisites

Before installing the Baghewala Digital Twin, ensure you have the following installed:

- **Python 3.8 or higher**
- **Node.js 18 or higher**
- **PostgreSQL 13 or higher** (optional for full functionality)

## Quick Start

### 1. Clone or Download the Project

Ensure you have the project files in the `devin-SIH-120` directory.

### 2. Backend Installation

#### Option A: Full Installation (Recommended)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

#### Option B: Minimal Installation (Demo Mode)

For the quickest setup without PostgreSQL or NumPy:

```bash
cd backend

# Install minimal dependencies
pip install -r requirements-demo.txt

# Run the server
python main.py
```

The system will automatically use fallback implementations for missing dependencies and run in demo mode.

### 3. Frontend Installation

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## One-Click Start (Windows)

Use the provided `start.bat` file to start both servers:

```bash
start.bat
```

This will:
1. Start the backend server in a new window
2. Start the frontend server in a new window
3. Wait for you to press any key to stop both servers

## Manual Installation Steps

### Backend Dependencies

The backend requires the following Python packages:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
websockets==12.0
numpy==1.26.2
pandas==2.1.3
scipy==1.11.4
scikit-learn==1.3.2
torch==2.1.1
httpx==0.25.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
alembic==1.13.0
redis==5.0.1
celery==5.3.4
```

### Frontend Dependencies

The frontend requires the following Node packages:

```
react==^18.2.0
react-dom==^18.2.0
react-router-dom==^6.20.0
zustand==^4.4.7
three==^0.159.0
@react-three/fiber==^8.15.11
@react-three/drei==^9.88.13
recharts==^2.10.3
framer-motion==^10.16.16
lucide-react==^0.294.0
clsx==^2.0.0
tailwind-merge==^2.1.0
axios==^1.6.2
```

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'numpy'`

**Solution**: Install numpy
```bash
pip install numpy
```

**Issue**: Database connection error

**Solution**: The backend will run in demo mode without PostgreSQL. The simulation will still work, but data won't persist.

### Frontend Issues

**Issue**: `npm install` fails

**Solution**: Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

**Issue**: Port 3000 already in use

**Solution**: Change the port in `vite.config.ts` or stop the conflicting process.

### Common Issues

**Issue**: CORS errors between frontend and backend

**Solution**: Ensure both servers are running and check the proxy configuration in `vite.config.ts`.

**Issue**: WebSocket connection fails

**Solution**: Check that the backend WebSocket endpoint is accessible at `ws://localhost:8000/ws/digital-twin`.

## Environment Variables

### Backend (.env)

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/baghewala_digital_twin
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/digital-twin
```

## Production Deployment

For production deployment, you would need to:

1. Set up a production PostgreSQL database
2. Configure environment variables for production
3. Build the frontend: `npm run build`
4. Use a production ASGI server like Gunicorn with Uvicorn workers
5. Set up proper CORS configuration
6. Implement authentication and security measures
7. Configure SSL/TLS certificates

## Development Tips

- The backend will automatically create database tables on first run
- All physics models are demonstration models and require field calibration
- The system uses simulated data by default - no real field connection
- WebSocket updates occur every 2 seconds
- The digital twin state is shared across all pages using Zustand

## Support

For issues or questions, refer to the main README.md file or check the API documentation at http://localhost:8000/docs when the backend is running.
