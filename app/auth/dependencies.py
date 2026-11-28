"""Authorization dependencies shared by every router (WBS-2.2, FR-04, NFR-03).

    from app.auth.dependencies import AdminUser, CurrentUser

    @router.get("/something")
    def member_endpoint(user: CurrentUser): ...

    @router.get("/admin/reports")
    def admin_endpoint(admin: AdminUser): ...

Every token problem answers 401 (the app should sign the user out); a valid
token with the wrong role answers 403.
"""

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth import service
from app.auth.tokens import TokenError
from app.database.dependencies import DbSession
from app.database.models import User

ROLE_USER = "USER"
ROLE_ADMIN = "ADMIN"

# auto_error=False: a missing header gets the same 401 body as a bad token.
_bearer = HTTPBearer(auto_error=False)

_MESSAGES = {
    "NOT_AUTHENTICATED": "Sign in to continue.",
    "TOKEN_EXPIRED": "The access token has expired.",
    "INVALID_TOKEN": "The access token is not valid.",
}


def auth_exception(status_code: int, code: str, message: str) -> HTTPException:
    headers = {"WWW-Authenticate": "Bearer"} if status_code == 401 else None
    return HTTPException(
        status_code=status_code,
        detail={"code": code, "message": message},
        headers=headers,
    )


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> User:
    if credentials is None:
        raise auth_exception(401, "NOT_AUTHENTICATED", _MESSAGES["NOT_AUTHENTICATED"])
    try:
        return service.user_for_access_token(db, credentials.credentials)
    except TokenError as exc:
        raise auth_exception(401, exc.code, _MESSAGES[exc.code]) from exc
    except service.AuthError as exc:
        # A suspended account is signed out, so it is a 401 here (FR-23).
        raise auth_exception(401, exc.code, exc.message) from exc


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: str) -> Callable[[User], User]:
    """Dependency that allows only the given roles. The role is read from the
    database, so a role change takes effect on the next request."""

    def dependency(user: CurrentUser) -> User:
        if user.role not in roles:
            raise auth_exception(403, "FORBIDDEN", "You do not have access to this function.")
        return user

    return dependency


# Administrators can use every member function too, so member endpoints only
# need CurrentUser.
AdminUser = Annotated[User, Depends(require_role(ROLE_ADMIN))]
