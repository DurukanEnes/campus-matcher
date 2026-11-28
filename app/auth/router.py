from fastapi import APIRouter, Response

from app.auth import service
from app.auth.dependencies import CurrentUser, auth_exception
from app.auth.schemas import (
    ErrorResponse,
    LoginRequest,
    RefreshRequest,
    TokenResponse,
    UserOut,
)
from app.database.dependencies import DbSession

router = APIRouter(prefix="/auth", tags=["auth"])

_errors = {401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}}


def _token_response(issued: service.IssuedTokens) -> TokenResponse:
    return TokenResponse(
        access_token=issued.access_token,
        refresh_token=issued.refresh_token,
        user=UserOut.model_validate(issued.user),
    )


@router.post("/login", response_model=TokenResponse, responses=_errors)
def login(body: LoginRequest, db: DbSession) -> TokenResponse:
    """FR-03. 401 INVALID_CREDENTIALS, 403 EMAIL_NOT_VERIFIED or ACCOUNT_SUSPENDED."""
    try:
        return _token_response(service.login(db, body.email, body.password))
    except service.AuthError as exc:
        raise auth_exception(exc.status_code, exc.code, exc.message) from exc


@router.post("/refresh", response_model=TokenResponse, responses=_errors)
def refresh(body: RefreshRequest, db: DbSession) -> TokenResponse:
    """Returns a new token pair; the refresh token sent here stops working."""
    try:
        return _token_response(service.refresh(db, body.refresh_token))
    except service.AuthError as exc:
        raise auth_exception(exc.status_code, exc.code, exc.message) from exc


@router.post("/logout", status_code=204)
def logout(body: RefreshRequest, db: DbSession) -> Response:
    """Ends the session of this device. Works with an expired access token and
    answers 204 even for an unknown token."""
    service.logout(db, body.refresh_token)
    return Response(status_code=204)


@router.get("/me", response_model=UserOut, responses=_errors)
def me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)
