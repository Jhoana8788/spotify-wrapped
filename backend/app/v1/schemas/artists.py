from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ArtistImage(BaseModel):
    url: str
    height: Optional[int]
    width: Optional[int]

class Artist(BaseModel):
    id: str
    name: str
    genres: Optional[List[str]] = []
    popularity: Optional[int]
    images: Optional[List[ArtistImage]] = []

class TopArtistsResponse(BaseModel):
    items: List[Artist]