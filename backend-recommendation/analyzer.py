from typing import Dict, List, Any, Tuple
from roles import get_role_skills
from models import (
    EmployeeDetail,
    SkillLevelInfo,
    SkillGapInfo,
    RecommendedCourse,
    RecommendationSummary,
    RecommendationResponse,
)

# Skill level hierarchy
SKILL_LEVEL_HIERARCHY: Dict[str, int] = {
    "BEGINNER": 1,
    "INTERMEDIATE": 2,
    "ADVANCED": 3,
    "EXPERT": 4,
}

HIERARCHY_TO_LEVEL: Dict[int, str] = {
    1: "BEGINNER",
    2: "INTERMEDIATE",
    3: "ADVANCED",
    4: "EXPERT",
}


def get_skill_level_num(level_str: str | None) -> int:
    """Convert skill level name to numeric value (1 to 4), or 0 if missing/invalid."""
    if not level_str:
        return 0
    return SKILL_LEVEL_HIERARCHY.get(level_str.strip().upper(), 0)


def normalize_skill_name(name: str | None) -> str:
    """Normalize skill name for matching (e.g., 'Spring Boot' -> 'springboot')."""
    if not name:
        return ""
    return "".join(name.strip().lower().split())


def analyze_skill_gaps_and_recommend(
    employee_data: Dict[str, Any],
    employee_skills_data: List[Dict[str, Any]],
    target_role: str,
    all_courses: List[Dict[str, Any]],
) -> RecommendationResponse:
    """
    Core rule-based recommendation algorithm:
    1. Compares employee skills with required skills for the target role.
    2. Identifies missing skills and skills needing improvement.
    3. Excludes skills already mastered.
    4. Finds matching courses for each gap and ranks them by gap size.
    5. Flags gaps with no matching courses in the catalog.
    6. Generates clear, human-readable explanations.
    """
    required_role_skills = get_role_skills(target_role)
    if required_role_skills is None:
        raise ValueError(f"Unknown target role '{target_role}'.")

    # 1. Parse employee's current skills
    current_skills_map: Dict[str, Tuple[str, int]] = {}
    current_skills_list: List[SkillLevelInfo] = []

    for es in employee_skills_data:
        skill_obj = es.get("skill") or {}
        raw_skill_name = skill_obj.get("name")
        raw_level = es.get("level")

        if raw_skill_name:
            norm_name = normalize_skill_name(raw_skill_name)
            level_num = get_skill_level_num(raw_level)
            current_skills_map[norm_name] = (raw_level or "UNKNOWN", level_num)
            current_skills_list.append(
                SkillLevelInfo(
                    skillName=raw_skill_name,
                    level=raw_level or "UNKNOWN",
                    numericLevel=level_num,
                )
            )

    # 2. Parse required skills for target role
    required_skills_list: List[SkillLevelInfo] = []
    for skill_name, req_level in required_role_skills.items():
        required_skills_list.append(
            SkillLevelInfo(
                skillName=skill_name,
                level=req_level,
                numericLevel=get_skill_level_num(req_level),
            )
        )

    # 3. Build lookup for courses by normalized skill name
    courses_by_skill: Dict[str, List[Dict[str, Any]]] = {}
    for course in all_courses:
        course_skill = course.get("skill") or {}
        course_skill_name = course_skill.get("name")
        if course_skill_name:
            norm = normalize_skill_name(course_skill_name)
            if norm not in courses_by_skill:
                courses_by_skill[norm] = []
            courses_by_skill[norm].append(course)

    # 4. Analyze gaps for each required skill
    skill_gaps: List[SkillGapInfo] = []
    recommended_courses: List[RecommendedCourse] = []
    explanations: List[str] = []

    mastered_count = 0
    needs_improvement_count = 0
    missing_count = 0

    for skill_name, req_level in required_role_skills.items():
        norm_name = normalize_skill_name(skill_name)
        req_num = get_skill_level_num(req_level)

        if norm_name in current_skills_map:
            cur_level, cur_num = current_skills_map[norm_name]
        else:
            cur_level, cur_num = "NONE", 0

        gap_size = max(0, req_num - cur_num)
        matching_courses = courses_by_skill.get(norm_name, [])
        has_course = len(matching_courses) > 0

        if cur_num == 0:
            gap_type = "MISSING"
            missing_count += 1
            status_desc = f"Missing skill: Target role requires {req_level} proficiency."
            if has_course:
                explanations.append(
                    f"• {skill_name}: Missing skill (Required: {req_level}). {len(matching_courses)} training course(s) recommended."
                )
            else:
                explanations.append(
                    f"• {skill_name}: Missing skill (Required: {req_level}). No suitable training course is currently available in the database."
                )
        elif cur_num < req_num:
            gap_type = "NEEDS_IMPROVEMENT"
            needs_improvement_count += 1
            status_desc = f"Needs improvement from {cur_level} to {req_level} (gap of {gap_size} level{'s' if gap_size > 1 else ''})."
            if has_course:
                explanations.append(
                    f"• {skill_name}: Needs improvement from {cur_level} to {req_level}. {len(matching_courses)} training course(s) recommended."
                )
            else:
                explanations.append(
                    f"• {skill_name}: Needs improvement from {cur_level} to {req_level}. No suitable training course is currently available in the database."
                )
        else:
            gap_type = "MASTERED"
            mastered_count += 1
            status_desc = f"Skill requirement satisfied (Current: {cur_level}, Required: {req_level})."
            explanations.append(
                f"• {skill_name}: Mastered / Satisfied ({cur_level} satisfies required {req_level}). No training needed."
            )

        skill_gaps.append(
            SkillGapInfo(
                skillName=skill_name,
                requiredLevel=req_level,
                requiredLevelNum=req_num,
                currentLevel=cur_level,
                currentLevelNum=cur_num,
                gapSize=gap_size,
                gapType=gap_type,
                statusDescription=status_desc,
                hasMatchingCourse=has_course,
            )
        )

        # 5. Course recommendations: Only recommend if there is a gap (gap_size > 0)
        # Avoid recommending courses for skills already mastered!
        if gap_size > 0 and has_course:
            for c in matching_courses:
                if cur_num == 0:
                    reason = (
                        f"Employee has no prior record in {skill_name}. "
                        f"Recommended to gain required {req_level} proficiency."
                    )
                else:
                    reason = (
                        f"Skill gap of {gap_size} level{'s' if gap_size > 1 else ''}: "
                        f"Employee currently at {cur_level}, target role requires {req_level}."
                    )

                recommended_courses.append(
                    RecommendedCourse(
                        courseId=c.get("id"),
                        courseName=c.get("name", "Untitled Course"),
                        description=c.get("description"),
                        duration=c.get("duration"),
                        provider=c.get("provider"),
                        skillName=skill_name,
                        currentLevel=cur_level,
                        requiredLevel=req_level,
                        gapSize=gap_size,
                        reason=reason,
                    )
                )

    # 6. Rank recommended courses by gap size (descending - largest skill gaps first)
    recommended_courses.sort(key=lambda x: x.gapSize, reverse=True)

    # Calculate readiness percentage
    total_required = len(required_role_skills)
    readiness = round((mastered_count / total_required) * 100, 1) if total_required > 0 else 0.0

    summary = RecommendationSummary(
        totalRequiredSkills=total_required,
        masteredSkillsCount=mastered_count,
        needsImprovementCount=needs_improvement_count,
        missingSkillsCount=missing_count,
        recommendedCoursesCount=len(recommended_courses),
        roleReadinessPercentage=readiness,
    )

    employee_detail = EmployeeDetail(
        id=employee_data.get("id"),
        name=employee_data.get("name", ""),
        email=employee_data.get("email"),
        department=employee_data.get("department"),
        designation=employee_data.get("designation"),
        phone=employee_data.get("phone"),
    )

    return RecommendationResponse(
        employee=employee_detail,
        targetRole=target_role,
        currentSkills=current_skills_list,
        requiredSkills=required_skills_list,
        skillGaps=skill_gaps,
        recommendedCourses=recommended_courses,
        recommendationExplanations=explanations,
        summary=summary,
    )
