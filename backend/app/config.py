import os
from pydantic_settings import BaseSettings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "cs2_tactical_hq.db").replace("\\", "/")

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "127.0.0.1"
    
    # Base de données SQLite locale absolue
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
