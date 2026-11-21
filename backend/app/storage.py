import uuid
from fastapi import HTTPException, UploadFile
from supabase import Client, create_client
from app.config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def upload_project_image(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WEBP images are supported.")

    contents = await file.read()
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "png"
    file_path = f"projects/{uuid.uuid4()}.{ext}"

    supabase.storage.from_(settings.supabase_bucket).upload(
        path=file_path,
        file=contents,
        file_options={"content-type": file.content_type, "upsert": "false"},
    )

    return supabase.storage.from_(settings.supabase_bucket).get_public_url(file_path)
