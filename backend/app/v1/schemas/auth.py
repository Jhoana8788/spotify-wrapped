from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int

class AuthRequest(BaseModel):
    code: str  # Código recibido del flujo de autorización de Spotify