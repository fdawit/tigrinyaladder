"""Run a local development server for Tigrinya Thinking Path.

Usage from the project root:
    python3 python/server.py
Then open http://localhost:8000
"""
from __future__ import annotations

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)

PORT = 8000
print(f"Serving {ROOT} at http://localhost:{PORT}")
ThreadingHTTPServer(("", PORT), SimpleHTTPRequestHandler).serve_forever()
