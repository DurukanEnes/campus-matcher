# Kept for existing imports; both dependencies now live in shared modules.
from app.auth.dependencies import get_current_user
from app.database.dependencies import get_db

__all__ = ["get_current_user", "get_db"]
