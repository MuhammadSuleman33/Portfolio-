import json
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from app.auth import verify_admin
from app.schemas import ProjectOut
from app.storage import supabase, upload_project_image

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("/", response_model=list[ProjectOut])
def list_projects():
    response = (
        supabase.table("projects")
        .select("*")
        .order("featured", desc=True)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    title: str = Form(...),
    summary: str = Form(...),
    description: str = Form(...),
    tech_stack: str = Form("[]"),
    github_url: Optional[str] = Form(None),
    live_url: Optional[str] = Form(None),
    featured: bool = Form(False),
    image: UploadFile = File(...),
    _: str = Depends(verify_admin),
):
    try:
        parsed_stack = json.loads(tech_stack)
        if not isinstance(parsed_stack, list):
            raise ValueError
    except ValueError:
        parsed_stack = [tag.strip() for tag in tech_stack.split(",") if tag.strip()]

    image_url = await upload_project_image(image)

    payload = {
        "title": title,
        "summary": summary,
        "description": description,
        "tech_stack": parsed_stack,
        "image_url": image_url,
        "github_url": github_url or None,
        "live_url": live_url or None,
        "featured": featured,
    }

    response = supabase.table("projects").insert(payload).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to insert project into Supabase")
    return response.data[0]


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    _: str = Depends(verify_admin),
):
    response = supabase.table("projects").delete().eq("id", project_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
