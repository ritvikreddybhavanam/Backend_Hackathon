# Skill Gap Analysis & Training Recommendation Service

A lightweight, rule-based AI recommendation service built using **Python 3**, **FastAPI**, **Uvicorn**, **Requests**, and **Pydantic**. It integrates seamlessly with the existing Java Spring Boot backend (port 8080) and React frontend (port 5173).

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│                 (http://localhost:5173)                     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
    Existing Platform APIs           Skill Gap Analysis &
    (Employees, Skills, Courses)     Recommendations
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Java Spring Boot        │ │     Python FastAPI         │
│         (Port 8080)          │ │     Recommendation API     │
│                              │ │        (Port 8000)         │
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               │ HTTP GET /employees/{id}      │
               │ HTTP GET /employee-skills/... │
               │ HTTP GET /trainings/courses   │
               └───────────────────────────────┘
```

The Python service **never connects directly to MySQL**. It retrieves employee details, employee skills, and training courses through Spring Boot's RESTful endpoints via HTTP requests.

---

## 2. Recommendation Logic & Skill Hierarchy

The system uses a 4-tier numeric hierarchy:

| Skill Level | Numeric Weight |
|:---|:---:|
| **BEGINNER** | 1 |
| **INTERMEDIATE** | 2 |
| **ADVANCED** | 3 |
| **EXPERT** | 4 |
| *Missing / Unregistered* | 0 |

### Algorithm Steps:
1. **Retrieve Employee Skills**: Fetches the employee's current skill profile from Spring Boot.
2. **Compare Against Target Role**: Evaluates current proficiency against the required proficiency for the selected target role.
3. **Classify Skill Status**:
   - **MASTERED / SATISFIED**: `current_level >= required_level` (No training needed).
   - **NEEDS IMPROVEMENT**: `1 <= current_level < required_level` (`gap = required - current`).
   - **MISSING**: `current_level == 0` (`gap = required`).
4. **Course Matching**: Matches courses from the catalog where `course.skill.name == gap.skill_name`.
5. **Gap Ranking**: Recommended courses are sorted in descending order of gap size (`gapSize`), prioritizing larger skill gaps first.
6. **Mastered Skill Exclusion**: Courses for already-mastered skills are strictly excluded from recommendations.
7. **Catalog Availability Check**: If no course exists in the database for an identified gap, it is clearly flagged as `No suitable training course is available`.
8. **Explainability**: Every recommendation includes a human-readable reason (e.g. *"Skill gap of 1 level: Employee currently at INTERMEDIATE, target role requires ADVANCED."*).

---

## 3. Predefined Target Roles

- **Backend Developer**:
  - Java: `ADVANCED`
  - Spring Boot: `INTERMEDIATE`
  - SQL: `INTERMEDIATE`
  - MySQL: `INTERMEDIATE`

- **Frontend Developer**:
  - React: `ADVANCED`
  - JavaScript: `ADVANCED`
  - HTML: `INTERMEDIATE`
  - CSS: `INTERMEDIATE`

- **Data Analyst**:
  - Python: `ADVANCED`
  - SQL: `ADVANCED`
  - Excel: `INTERMEDIATE`
  - Data Visualization: `INTERMEDIATE`

---

## 4. API Endpoints

### `GET /health`
Returns service status and Spring Boot connectivity URL.
```json
{
  "status": "healthy",
  "service": "Skill Gap Analysis and Training Recommendation API",
  "version": "1.0.0",
  "spring_boot_api_url": "http://localhost:8080/api"
}
```

### `GET /roles`
Returns the predefined roles and their required skill proficiencies.

### `POST /recommend`
Accepts:
```json
{
  "employeeId": 1,
  "targetRole": "Backend Developer"
}
```

Returns:
- `employee`: Details of the employee (id, name, department, designation, email, phone).
- `targetRole`: Target role evaluated.
- `currentSkills`: Employee's registered skills and levels.
- `requiredSkills`: Target role's required skills and levels.
- `skillGaps`: Identified gaps (level comparison, gapSize, gapType, statusDescription, hasMatchingCourse).
- `recommendedCourses`: Ranked training courses matching gaps.
- `recommendationExplanations`: Step-by-step audit explanations for demo and reporting.
- `summary`: Overall statistics and role readiness percentage (`roleReadinessPercentage`).

---

## 5. Setup & Running Instructions

### Prerequisites
- Python 3.10+
- Node.js & npm
- Java 17+ and Maven
- MySQL with `backend_db` running

### Step 1: Install Python Dependencies
```bash
cd backend-recommendation
pip install -r requirements.txt
```

### Step 2: Run the Services

#### Option A: Run Everything Together (Single Command)
From the root directory:
```bash
npm run dev
```
This starts:
- Spring Boot backend on `http://localhost:8080`
- Python Recommendation service on `http://localhost:8000`
- React frontend on `http://localhost:5173`

#### Option B: Run Services Individually
- **Spring Boot Backend**:
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```
- **Python Recommendation Service**:
  ```bash
  cd backend-recommendation
  python main.py
  ```
- **React Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 6. Running Tests
Run the standalone Python unit test suite:
```bash
cd backend-recommendation
python test_recommendation.py
```
This tests:
1. Employee having all required skills (100% readiness, zero training recommendations).
2. Employee needing improvement and missing skills.
3. Employee missing all skills.
4. Handling when no matching course exists in the database.
5. Role and skill level hierarchy mappings.
