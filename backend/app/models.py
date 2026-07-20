from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SignUpRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class SignInRequest(BaseModel):
    email: str
    password: str

class FarmCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    lat: float
    lng: float

class FieldCreate(BaseModel):
    farm_id: str
    name: str
    boundary: List[List[float]]

class CropCreate(BaseModel):
    field_id: str
    crop_type: str
    variety: Optional[str] = ""
    planting_date: Optional[str] = None
    expected_harvest: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    farm_id: Optional[str] = None
    field_id: Optional[str] = None
    language: Optional[str] = "en"

class ReportRequest(BaseModel):
    farm_id: str
    report_type: str = "summary"

class AlertSubscribe(BaseModel):
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    types: List[str] = ["critical"]

class AnalysisRequest(BaseModel):
    field_id: str
    include_indices: bool = True
    include_soil: bool = True
    include_weather: bool = True
