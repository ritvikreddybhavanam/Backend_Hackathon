"""
Predefined target roles and their required skill proficiencies.
"""

from typing import Dict, List

PREDEFINED_ROLES: Dict[str, Dict[str, str]] = {
    "Backend Developer": {
        "Java": "ADVANCED",
        "Spring Boot": "INTERMEDIATE",
        "SQL": "INTERMEDIATE",
        "MySQL": "INTERMEDIATE",
    },
    "Frontend Developer": {
        "React": "ADVANCED",
        "JavaScript": "ADVANCED",
        "HTML": "INTERMEDIATE",
        "CSS": "INTERMEDIATE",
    },
    "Data Analyst": {
        "Python": "ADVANCED",
        "SQL": "ADVANCED",
        "Excel": "INTERMEDIATE",
        "Data Visualization": "INTERMEDIATE",
    },
}


def get_available_roles() -> List[dict]:
    """
    Returns the list of roles and their required skills formatted for API responses.
    """
    result = []
    for role_name, skills in PREDEFINED_ROLES.items():
        skill_list = [
            {"skillName": skill, "requiredLevel": level}
            for skill, level in skills.items()
        ]
        result.append({
            "roleName": role_name,
            "requiredSkills": skill_list
        })
    return result


def get_role_skills(role_name: str) -> Dict[str, str] | None:
    """
    Finds required skills for a role (case-insensitive lookup).
    """
    for name, skills in PREDEFINED_ROLES.items():
        if name.lower() == role_name.strip().lower():
            return skills
    return None
