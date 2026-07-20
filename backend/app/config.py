import os
from dotenv import load_dotenv
load_dotenv()

class Settings:
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    opencode_api_key: str = os.getenv("OPENCODE_API_KEY", "")
    copernicus_username: str = os.getenv("COPERNICUS_USERNAME", "")
    copernicus_password: str = os.getenv("COPERNICUS_PASSWORD", "")
    copernicus_client_id: str = os.getenv("COPERNICUS_CLIENT_ID", "cdse-public")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    jwt_secret: str = os.getenv("JWT_SECRET", "terralogy-secret-change-in-production")

settings = Settings()
