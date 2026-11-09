from typing import List
from fastapi import APIRouter, HTTPException, Response
from app.schemas.watchface_schemas import (
    WatchFaceResponse, WatchFaceCreate, AIGenerateWatchFaceRequest,
    AIGenerateWatchFaceResponse, ExportWallpaperRequest, ExportWallpaperResponse
)
from app.services.watch_face_service import watch_face_service
from app.services.compatibility_service import compatibility_service

router = APIRouter(prefix="/api/watchfaces", tags=["watchfaces"])

@router.get("", response_model=List[WatchFaceResponse])
def get_watchfaces():
    return watch_face_service.get_all_designs()

@router.get("/{design_id}", response_model=WatchFaceResponse)
def get_watchface(design_id: str):
    wf = watch_face_service.get_design_by_id(design_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Watch face design not found")
    return wf

@router.post("", response_model=WatchFaceResponse)
def create_watchface(payload: WatchFaceCreate):
    return watch_face_service.create_design(payload)

@router.delete("/{design_id}")
def delete_watchface(design_id: str):
    success = watch_face_service.delete_design(design_id)
    if not success:
        raise HTTPException(status_code=404, detail="Design not found or could not be deleted")
    return {"status": "DELETED", "id": design_id}

@router.post("/ai-generate", response_model=AIGenerateWatchFaceResponse)
def generate_ai_watchface(req: AIGenerateWatchFaceRequest):
    return watch_face_service.generate_ai_design(req)

@router.post("/export", response_model=ExportWallpaperResponse)
def export_wallpaper(req: ExportWallpaperRequest):
    return watch_face_service.export_wallpaper(req)

@router.get("/download/{file_name}")
def download_wallpaper(file_name: str):
    # Generates a crisp SVG/raster companion wallpaper matching resolution
    parts = file_name.replace(".png", "").replace(".svg", "").split("_")
    res_part = parts[-1] if "x" in parts[-1] else "240x280"
    try:
        w_str, h_str = res_part.split("x")
        w, h = int(w_str), int(h_str)
    except Exception:
        w, h = 240, 280

    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FE"/>
      <stop offset="100%" stop-color="#4FACFE"/>
    </linearGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#bg)"/>
  <circle cx="{w/2}" cy="{h/2}" r="{min(w,h)*0.42}" fill="none" stroke="rgba(0, 242, 254, 0.15)" stroke-width="2"/>
  <circle cx="{w/2}" cy="{h/2}" r="{min(w,h)*0.38}" fill="none" stroke="rgba(157, 78, 221, 0.2)" stroke-width="1.5" stroke-dasharray="4 6"/>
  <text x="{w/2}" y="{h*0.48}" font-family="sans-serif" font-size="{int(min(w,h)*0.16)}" font-weight="700" fill="#00F2FE" text-anchor="middle" dominant-baseline="middle">10:42</text>
  <text x="{w/2}" y="{h*0.58}" font-family="sans-serif" font-size="{int(min(w,h)*0.055)}" font-weight="500" fill="#94A3B8" text-anchor="middle">WED, OCT 29</text>
  <text x="{w/2}" y="{h*0.88}" font-family="sans-serif" font-size="{int(min(w,h)*0.045)}" font-weight="600" fill="#00FF88" text-anchor="middle">WRISTOS • {w}x{h}</text>
</svg>"""

    return Response(
        content=svg_content,
        media_type="image/svg+xml",
        headers={"Content-Disposition": f"attachment; filename={file_name.replace('.png', '.svg')}"}
    )
