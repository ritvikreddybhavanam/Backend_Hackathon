import logging
import requests
from typing import Optional, List, Dict, Any
from config import SPRING_BOOT_API_URL

logger = logging.getLogger("recommendation-client")


class BackendServiceException(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class EmployeeNotFoundException(Exception):
    def __init__(self, employee_id: int):
        super().__init__(f"Employee with ID {employee_id} not found.")
        self.status_code = 404


def get_employee(employee_id: int) -> Dict[str, Any]:
    """
    Fetch employee details from Spring Boot backend.
    """
    url = f"{SPRING_BOOT_API_URL}/employees/{employee_id}"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 404 or response.content == b"" or response.json() is None:
            raise EmployeeNotFoundException(employee_id)
        response.raise_for_status()
        data = response.json()
        if not data or not data.get("id"):
            raise EmployeeNotFoundException(employee_id)
        return data
    except requests.exceptions.ConnectionError:
        raise BackendServiceException(
            f"Unable to connect to Spring Boot backend at {SPRING_BOOT_API_URL}. Is the backend running?",
            status_code=503
        )
    except requests.exceptions.Timeout:
        raise BackendServiceException(
            "Request to Spring Boot backend timed out.",
            status_code=504
        )
    except (EmployeeNotFoundException, BackendServiceException):
        raise
    except Exception as e:
        logger.error(f"Error fetching employee {employee_id}: {e}")
        raise BackendServiceException(f"Error communicating with backend: {str(e)}")


def get_employee_skills(employee_id: int) -> List[Dict[str, Any]]:
    """
    Fetch skills assigned to the given employee from Spring Boot.
    Tries the specific endpoint first, falling back to filtering all employee skills.
    """
    try:
        # First attempt: dedicated endpoint /api/employee-skills/employee/{employee_id}
        url = f"{SPRING_BOOT_API_URL}/employee-skills/employee/{employee_id}"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            skills = resp.json()
            if isinstance(skills, list):
                return skills

        # Fallback: get all employee skills and filter
        all_url = f"{SPRING_BOOT_API_URL}/employee-skills"
        fallback_resp = requests.get(all_url, timeout=5)
        fallback_resp.raise_for_status()
        all_skills = fallback_resp.json()
        return [
            item for item in all_skills
            if item.get("employee") and item["employee"].get("id") == employee_id
        ]
    except requests.exceptions.ConnectionError:
        raise BackendServiceException(
            f"Unable to connect to Spring Boot backend at {SPRING_BOOT_API_URL}.",
            status_code=503
        )
    except BackendServiceException:
        raise
    except Exception as e:
        logger.error(f"Error fetching employee skills for {employee_id}: {e}")
        return []


def get_all_courses() -> List[Dict[str, Any]]:
    """
    Fetch all training courses from Spring Boot backend.
    """
    url = f"{SPRING_BOOT_API_URL}/trainings/courses"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        courses = response.json()
        return courses if isinstance(courses, list) else []
    except requests.exceptions.ConnectionError:
        raise BackendServiceException(
            f"Unable to connect to Spring Boot backend at {SPRING_BOOT_API_URL}.",
            status_code=503
        )
    except BackendServiceException:
        raise
    except Exception as e:
        logger.error(f"Error fetching training courses: {e}")
        return []
