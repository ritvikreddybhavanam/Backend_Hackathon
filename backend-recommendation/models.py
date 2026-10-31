from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class RecommendationRequest(BaseModel):
    employee_id: int = Field(..., alias="employeeId", description="ID of the employee")
    target_role: str = Field(..., alias="targetRole", description="Target role name e.g. Backend Developer")

    model_config = ConfigDict(populate_by_name=True)


class EmployeeDetail(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None


class SkillLevelInfo(BaseModel):
    skillName: str
    level: str
    numericLevel: int


class SkillGapInfo(BaseModel):
    skillName: str
    requiredLevel: str
    requiredLevelNum: int
    currentLevel: str
    currentLevelNum: int
    gapSize: int
    gapType: str  # "MISSING", "NEEDS_IMPROVEMENT", "MASTERED"
    statusDescription: str
    hasMatchingCourse: bool


class RecommendedCourse(BaseModel):
    courseId: int
    courseName: str
    description: Optional[str] = None
    duration: Optional[str] = None
    provider: Optional[str] = None
    skillName: str
    currentLevel: str
    requiredLevel: str
    gapSize: int
    reason: str


class RecommendationSummary(BaseModel):
    totalRequiredSkills: int
    masteredSkillsCount: int
    needsImprovementCount: int
    missingSkillsCount: int
    recommendedCoursesCount: int
    roleReadinessPercentage: float


class RecommendationResponse(BaseModel):
    employee: EmployeeDetail
    targetRole: str
    currentSkills: List[SkillLevelInfo]
    requiredSkills: List[SkillLevelInfo]
    skillGaps: List[SkillGapInfo]
    recommendedCourses: List[RecommendedCourse]
    recommendationExplanations: List[str]
    summary: RecommendationSummary
