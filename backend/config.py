"""
Configuration for Clinical Trial Payment Reconciliation
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # Anthropic API
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        if not Config.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")
    
    @staticmethod
    def setup_litellm_for_anthropic():
        """Setup environment for LiteLLM to use Anthropic"""
        # Set the API key for LiteLLM
        os.environ['ANTHROPIC_API_KEY'] = Config.ANTHROPIC_API_KEY