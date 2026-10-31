import logging
import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from config import HOST, PORT, SPRING_BOOT_API_URL
from models import RecommendationRequest, RecommendationResponse
from roles import get_available_roles, get_role_skills
from client import (
    get_employee,
    get_employee_skills,
    get_all_courses,
    EmployeeNotFoundException,
    BackendServiceException,
)
from analyzer import analyze_skill_gaps_and_recommend

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("recommendation-api")

app = FastAPI(
    title="Skill Gap Analysis & Training Recommendation Service",
    description="Analyzes employee skills against target job roles and recommends suitable training courses.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint returning service status."""
    return {
        "status": "healthy",
        "service": "Skill Gap Analysis and Training Recommendation API",
        "version": "1.0.0",
        "spring_boot_api_url": SPRING_BOOT_API_URL
    }


@app.get("/roles", status_code=status.HTTP_200_OK)
def list_roles():
    """Returns available target roles and their required skills."""
    return get_available_roles()


@app.post("/recommend", response_model=RecommendationResponse, status_code=status.HTTP_200_OK)
def recommend_training(request: RecommendationRequest):
    """
    Perform skill gap analysis for a given employee and target role,
    and recommend training courses to bridge identified gaps.
    """
    employee_id = request.employee_id
    target_role = request.target_role.strip()

    logger.info(f"Received recommendation request for employee ID {employee_id}, role: '{target_role}'")

    # 1. Validate target role
    role_skills = get_role_skills(target_role)
    if not role_skills:
        available = [r["roleName"] for r in get_available_roles()]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target role '{target_role}' not found. Available roles: {', '.join(available)}"
        )

    # 2. Fetch employee details from Spring Boot
    try:
        employee_data = get_employee(employee_id)
    except EmployeeNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BackendServiceException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))

    # 3. Fetch employee skills & courses
    try:
        employee_skills = get_employee_skills(employee_id)
        courses = get_all_courses()
    except BackendServiceException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))

    # 4. Perform analysis and compute recommendations
    try:
        response = analyze_skill_gaps_and_recommend(
            employee_data=employee_data,
            employee_skills_data=employee_skills,
            target_role=target_role,
            all_courses=courses
        )
        logger.info(
            f"Analysis completed for employee '{response.employee.name}': "
            f"{response.summary.recommendedCoursesCount} courses recommended."
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception(f"Unexpected error during recommendation analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing skill gap analysis: {str(e)}"
        )


if __name__ == "__main__":
    logger.info(f"Starting Recommendation Service on {HOST}:{PORT}...")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
