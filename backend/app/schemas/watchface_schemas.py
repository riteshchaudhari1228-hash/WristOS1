from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class WatchFaceBase(BaseModel):
    name: str = "Neon Cyberpunk"
    theme: str = "cyberpunk"  # college, sports, minimal, gaming, cyberpunk, business, neon
    style: str = "digital"    # digital, analog, hybrid
    target_model_id: str = "boat-wave-call-2"
    resolution_width: int = 240
    resolution_height: int = 280
    clock_font: str = "Space Grotesk"
    clock_position: str = "center"  # top, center, bottom
    time_format: str = "24h"
    primary_color: str = "#00F2FE"
    secondary_color: str = "#9d4edd"
    accent_color: str = "#00FF88"
    background_type: str = "ai_art"  # ai_art, gradient, pattern, solid, upload
    background_prompt: str = ""
    background_image_data: Optional[str] = None
    show_seconds: bool = True
    show_date: bool = True
    show_steps: bool = True
    show_heart_rate: bool = True
    show_battery: bool = True
    show_calories: bool = False

class WatchFaceCreate(WatchFaceBase):
    pass

class WatchFaceUpdate(BaseModel):
    name: Optional[str] = None
    theme: Optional[str] = None
    style: Optional[str] = None
    target_model_id: Optional[str] = None
    resolution_width: Optional[int] = None
    resolution_height: Optional[int] = None
    clock_font: Optional[str] = None
    clock_position: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    background_type: Optional[str] = None
    background_prompt: Optional[str] = None
    background_image_data: Optional[str] = None
    show_seconds: Optional[bool] = None
    show_date: Optional[bool] = None
    show_steps: Optional[bool] = None
    show_heart_rate: Optional[bool] = None
    show_battery: Optional[bool] = None

class WatchFaceResponse(WatchFaceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIGenerateWatchFaceRequest(BaseModel):
    prompt: str = Field(..., description="E.g., 'A collegiate navy and gold academic watch face for exam week'")
    theme_hint: Optional[str] = None
    target_model_id: Optional[str] = "noise-colorfit-pro-4"

class AIGenerateWatchFaceResponse(BaseModel):
    generated_design: WatchFaceResponse
    ai_concept_reasoning: str
    palette_used: List[str]
    suggested_routine: Optional[str] = None
    export_notice: str

class ExportWallpaperRequest(BaseModel):
    design_id: str
    target_model_id: str
    format: str = "PNG" # PNG, JPG
    apply_compression: bool = False

class ExportWallpaperResponse(BaseModel):
    design_id: str
    target_model: str
    dimensions: str
    file_name: str
    download_url: str
    official_app_name: str
    is_direct_ota: bool
    install_instructions: List[str]
    compatibility_warning: str
