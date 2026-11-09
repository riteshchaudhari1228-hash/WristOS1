import uuid
from datetime import datetime, timezone
from typing import List, Optional
from app.schemas.watchface_schemas import (
    WatchFaceResponse, WatchFaceCreate, AIGenerateWatchFaceRequest,
    AIGenerateWatchFaceResponse, ExportWallpaperRequest, ExportWallpaperResponse
)
from app.services.compatibility_service import compatibility_service

DEFAULT_PRESETS: List[WatchFaceResponse] = [
    WatchFaceResponse(
        id="preset-cyberpunk-neon",
        name="Cyberpunk Lumina",
        theme="cyberpunk",
        style="digital",
        target_model_id="boat-wave-call-2",
        resolution_width=240,
        resolution_height=284,
        clock_font="Space Grotesk",
        clock_position="center",
        time_format="24h",
        primary_color="#00F2FE",
        secondary_color="#9d4edd",
        accent_color="#00FF88",
        background_type="ai_art",
        background_prompt="Futuristic synthwave grid skyline with neon cyan horizon",
        background_image_data=None,
        show_seconds=True,
        show_date=True,
        show_steps=True,
        show_heart_rate=True,
        show_battery=True,
        show_calories=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    ),
    WatchFaceResponse(
        id="preset-college-academic",
        name="Campus Horizon",
        theme="college",
        style="digital",
        target_model_id="noise-colorfit-pro-4",
        resolution_width=356,
        resolution_height=400,
        clock_font="Inter",
        clock_position="top",
        time_format="12h",
        primary_color="#38BDF8",
        secondary_color="#1E293B",
        accent_color="#FBBF24",
        background_type="gradient",
        background_prompt="Deep collegiate oxford navy with subtle geometric angles",
        background_image_data=None,
        show_seconds=False,
        show_date=True,
        show_steps=True,
        show_heart_rate=False,
        show_battery=True,
        show_calories=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    ),
    WatchFaceResponse(
        id="preset-minimal-analog",
        name="Geneva Monochrome",
        theme="minimal",
        style="analog",
        target_model_id="fireboltt-phoenix-ultra",
        resolution_width=360,
        resolution_height=360,
        clock_font="Cinzel",
        clock_position="center",
        time_format="12h",
        primary_color="#F8FAFC",
        secondary_color="#0F172A",
        accent_color="#EF4444",
        background_type="solid",
        background_prompt="Ultra matte obsidian black dial with crisp micro markers",
        background_image_data=None,
        show_seconds=True,
        show_date=True,
        show_steps=False,
        show_heart_rate=True,
        show_battery=True,
        show_calories=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    ),
    WatchFaceResponse(
        id="preset-sports-velocity",
        name="Aero Dynamic Red",
        theme="sports",
        style="digital",
        target_model_id="boat-xtend-plus",
        resolution_width=368,
        resolution_height=448,
        clock_font="Chakra Petch",
        clock_position="center",
        time_format="24h",
        primary_color="#22C55E",
        secondary_color="#EF4444",
        accent_color="#EAB308",
        background_type="pattern",
        background_prompt="Carbon fiber weave texture with dual dynamic activity rings",
        background_image_data=None,
        show_seconds=True,
        show_date=True,
        show_steps=True,
        show_heart_rate=True,
        show_battery=True,
        show_calories=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    ),
    WatchFaceResponse(
        id="preset-business-gold",
        name="Chronos Executive",
        theme="business",
        style="analog",
        target_model_id="noise-halo-plus",
        resolution_width=466,
        resolution_height=466,
        clock_font="Playfair Display",
        clock_position="center",
        time_format="12h",
        primary_color="#FFD700",
        secondary_color="#18181B",
        accent_color="#E2E8F0",
        background_type="gradient",
        background_prompt="Brushed sunburst titanium dial with chamfered gold markers",
        background_image_data=None,
        show_seconds=True,
        show_date=True,
        show_steps=True,
        show_heart_rate=False,
        show_battery=True,
        show_calories=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
]

# In-memory storage for saved user designs
SAVED_DESIGNS: List[WatchFaceResponse] = list(DEFAULT_PRESETS)

class WatchFaceService:
    @staticmethod
    def get_all_designs() -> List[WatchFaceResponse]:
        return SAVED_DESIGNS

    @staticmethod
    def get_design_by_id(design_id: str) -> Optional[WatchFaceResponse]:
        for d in SAVED_DESIGNS:
            if d.id == design_id:
                return d
        return None

    @staticmethod
    def create_design(data: WatchFaceCreate) -> WatchFaceResponse:
        device = compatibility_service.get_device_by_id(data.target_model_id)
        res_w = device.resolution_width if device else data.resolution_width
        res_h = device.resolution_height if device else data.resolution_height

        new_design = WatchFaceResponse(
            id=f"wf-{uuid.uuid4().hex[:8]}",
            name=data.name,
            theme=data.theme,
            style=data.style,
            target_model_id=data.target_model_id,
            resolution_width=res_w,
            resolution_height=res_h,
            clock_font=data.clock_font,
            clock_position=data.clock_position,
            time_format=data.time_format,
            primary_color=data.primary_color,
            secondary_color=data.secondary_color,
            accent_color=data.accent_color,
            background_type=data.background_type,
            background_prompt=data.background_prompt,
            background_image_data=data.background_image_data,
            show_seconds=data.show_seconds,
            show_date=data.show_date,
            show_steps=data.show_steps,
            show_heart_rate=data.show_heart_rate,
            show_battery=data.show_battery,
            show_calories=data.show_calories,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        SAVED_DESIGNS.append(new_design)
        return new_design

    @staticmethod
    def delete_design(design_id: str) -> bool:
        global SAVED_DESIGNS
        initial_len = len(SAVED_DESIGNS)
        SAVED_DESIGNS = [d for d in SAVED_DESIGNS if d.id != design_id]
        return len(SAVED_DESIGNS) < initial_len

    @staticmethod
    def generate_ai_design(request: AIGenerateWatchFaceRequest) -> AIGenerateWatchFaceResponse:
        prompt_lower = request.prompt.lower()
        device = compatibility_service.get_device_by_id(request.target_model_id or "noise-colorfit-pro-4")
        res_w = device.resolution_width if device else 240
        res_h = device.resolution_height if device else 280

        # Intelligent prompt styling engine
        if "gold" in prompt_lower or "black" in prompt_lower or "luxury" in prompt_lower:
            theme = "business"
            style = "analog"
            p_col = "#FFD700"
            s_col = "#121216"
            acc_col = "#E2E8F0"
            font = "Playfair Display"
            reasoning = "Synthesized luxury high-contrast gold metallic hues with obsidian dark backing for maximum AMOLED contrast."
            routine = "Executive Focus: Screen brightness set to moderate, silent alerts active."
        elif "college" in prompt_lower or "exam" in prompt_lower or "presentation" in prompt_lower:
            theme = "college"
            style = "digital"
            p_col = "#38BDF8"
            s_col = "#0F172A"
            acc_col = "#FBBF24"
            font = "Inter"
            reasoning = "Designed an academic layout with prominent date/time and muted complications for lecture hall readability."
            routine = "Campus Morning Routine: Silent vibration alarms, schedule reminders."
        elif "game" in prompt_lower or "cyberpunk" in prompt_lower or "sci-fi" in prompt_lower:
            theme = "gaming"
            style = "digital"
            p_col = "#EC4899"
            s_col = "#1E1B4B"
            acc_col = "#00FF88"
            font = "Space Grotesk"
            reasoning = "Generated high-intensity neon cyberpunk palette with dual cyan and magenta ambient gradients."
            routine = "Evening Gaming Context: High contrast time and battery indicator."
        elif "run" in prompt_lower or "sport" in prompt_lower or "fitness" in prompt_lower:
            theme = "sports"
            style = "digital"
            p_col = "#22C55E"
            s_col = "#18181B"
            acc_col = "#EAB308"
            font = "Chakra Petch"
            reasoning = "Configured high-energy athletic palette prioritizing live BPM zones and step progress bar."
            routine = "Pre-Workout Routine: Hydration nudge, step goal tracker front and center."
        else:
            theme = "minimal"
            style = "digital"
            p_col = "#00F2FE"
            s_col = "#0F172A"
            acc_col = "#9d4edd"
            font = "Space Grotesk"
            reasoning = f"Generated bespoke color palette inspired by '{request.prompt}'."
            routine = "Standard All-Day Routine."

        design = WatchFaceResponse(
            id=f"wf-ai-{uuid.uuid4().hex[:6]}",
            name=f"AI: {request.prompt[:24].title()}",
            theme=theme,
            style=style,
            target_model_id=device.id if device else "noise-colorfit-pro-4",
            resolution_width=res_w,
            resolution_height=res_h,
            clock_font=font,
            clock_position="center" if style == "analog" else "top",
            time_format="24h",
            primary_color=p_col,
            secondary_color=s_col,
            accent_color=acc_col,
            background_type="ai_art",
            background_prompt=request.prompt,
            background_image_data=None,
            show_seconds=True,
            show_date=True,
            show_steps=True,
            show_heart_rate=True,
            show_battery=True,
            show_calories=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        SAVED_DESIGNS.append(design)

        return AIGenerateWatchFaceResponse(
            generated_design=design,
            ai_concept_reasoning=reasoning,
            palette_used=[p_col, s_col, acc_col],
            suggested_routine=routine,
            export_notice=f"Optimized for {device.model_name if device else 'Smartwatch'} ({res_w}x{res_h} px). Export PNG for companion app upload."
        )

    @staticmethod
    def export_wallpaper(request: ExportWallpaperRequest) -> ExportWallpaperResponse:
        design = WatchFaceService.get_design_by_id(request.design_id)
        device = compatibility_service.get_device_by_id(request.target_model_id)

        w = device.resolution_width if device else (design.resolution_width if design else 240)
        h = device.resolution_height if device else (design.resolution_height if design else 280)
        model_name = device.model_name if device else "Smartwatch"
        app_name = device.companion_app if device else "Brand Companion App"

        file_name = f"wristos_wallpaper_{request.target_model_id}_{w}x{h}.png"
        instructions = device.app_guide_steps if device else [
            f"1. Download '{file_name}' to your phone.",
            f"2. Open {app_name}.",
            "3. Select Custom Watch Face / DIY Face and upload this image."
        ]

        warning = (
            f"Hardware Limitation: {model_name} firmware requires the official {app_name} "
            "to compile the final RTOS binary dial. WristOS exports the exact pixel-perfect wallpaper canvas. "
            "Never attempt to flash raw PNG files over raw Bluetooth without official app signature."
        )

        return ExportWallpaperResponse(
            design_id=request.design_id,
            target_model=model_name,
            dimensions=f"{w}x{h} px",
            file_name=file_name,
            download_url=f"/api/watchfaces/download/{file_name}",
            official_app_name=app_name,
            is_direct_ota=False,
            install_instructions=instructions,
            compatibility_warning=warning
        )

watch_face_service = WatchFaceService()
