"""
Unit test for CORS configuration fix (Bug 1).
Verifies that CORS is restricted to configured origins from Config.CORS_ORIGINS.
"""

import sys
import os
from pathlib import Path

# Add backend/ to sys.path so models and app can be imported
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

import pytest


@pytest.fixture(scope="module")
def app():
    """Create Flask app with testing config and push an app context."""
    from app import create_app
    from config import config_by_name
    flask_app = create_app(config_by_name["testing"])
    ctx = flask_app.app_context()
    ctx.push()
    yield flask_app
    ctx.pop()


@pytest.fixture(scope="module")
def client(app):
    """Create test client for making requests."""
    return app.test_client()


class TestCORSConfiguration:
    """Test CORS configuration is restricted to allowed origins."""
    
    def test_cors_uses_config_origins(self, app):
        """Verify CORS is configured with origins from Config.CORS_ORIGINS."""
        # Check that CORS_ORIGINS is defined in config
        assert 'CORS_ORIGINS' in app.config
        assert isinstance(app.config['CORS_ORIGINS'], list)
        assert len(app.config['CORS_ORIGINS']) > 0
    
    def test_cors_allows_configured_origin(self, client):
        """Verify requests from allowed origins are accepted."""
        # Make a request with an allowed origin
        response = client.get('/health', headers={
            'Origin': 'http://localhost:3000'
        })
        assert response.status_code == 200
        # Check CORS headers are present
        assert 'Access-Control-Allow-Origin' in response.headers
    
    def test_cors_config_contains_localhost(self, app):
        """Verify CORS_ORIGINS contains localhost development origins."""
        cors_origins = app.config['CORS_ORIGINS']
        # Check for common development origins
        assert any('localhost:3000' in origin for origin in cors_origins)
        assert any('localhost:5173' in origin for origin in cors_origins)
    
    def test_cors_not_wildcard(self, app):
        """Verify CORS is not configured with wildcard '*'."""
        cors_origins = app.config['CORS_ORIGINS']
        # Ensure wildcard is not in the list
        assert '*' not in cors_origins
