# Vercel serverless entry point for FastAPI.
# Vercel looks for a callable named `app` in api/index.py.
# We just re-export the FastAPI app from main.py.
import sys
import os

# Make the backend root importable
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app  # noqa: F401  — Vercel finds `app` here
