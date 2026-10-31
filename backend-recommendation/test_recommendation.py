import unittest
from analyzer import (
    analyze_skill_gaps_and_recommend,
    get_skill_level_num,
    normalize_skill_name,
)
from roles import get_available_roles, get_role_skills


class TestSkillGapAnalysis(unittest.TestCase):

    def setUp(self):
        self.sample_employee = {
            "id": 1,
            "name": "Rahul Sharma",
            "email": "rahul.sharma@gmail.com",
            "department": "IT",
            "designation": "Software Developer",
            "phone": "9876543210"
        }
        self.sample_courses = [
            {
                "id": 1,
                "name": "Advanced Java Programming",
                "description": "Learn OOP, multithreading, and advanced Java.",
                "duration": "30 Days",
                "provider": "Oracle Academy",
                "skill": {"id": 1, "name": "Java"}
            },
            {
                "id": 2,
                "name": "Python for Beginners",
                "description": "Learn Python basics and syntax.",
                "duration": "20 Days",
                "provider": "Internal Training Team",
                "skill": {"id": 2, "name": "Python"}
            },
            {
                "id": 3,
                "name": "SQL and Database Management",
                "description": "Master SQL queries and joins.",
                "duration": "15 Days",
                "provider": "HackerRank",
                "skill": {"id": 3, "name": "SQL"}
            },
            {
                "id": 4,
                "name": "React Frontend Development",
                "description": "Learn React hooks, state, and components.",
                "duration": "25 Days",
                "provider": "Meta",
                "skill": {"id": 5, "name": "React"}
            }
            # Note: No courses for Spring Boot or Excel or Data Visualization in this test catalog!
        ]

    def test_roles_and_levels(self):
        roles = get_available_roles()
        self.assertEqual(len(roles), 3)
        self.assertEqual(get_skill_level_num("BEGINNER"), 1)
        self.assertEqual(get_skill_level_num("INTERMEDIATE"), 2)
        self.assertEqual(get_skill_level_num("ADVANCED"), 3)
        self.assertEqual(get_skill_level_num("EXPERT"), 4)
        self.assertEqual(get_skill_level_num("UNKNOWN"), 0)

    def test_scenario_2_some_skills_need_improvement_and_some_missing(self):
        """
        Employee: Rahul Sharma
        Current:
          Java: INTERMEDIATE (2)
          SQL: ADVANCED (3)
        Target: Backend Developer
          Java: ADVANCED (3) -> gap: 1 (needs improvement)
          Spring Boot: INTERMEDIATE (2) -> gap: 2 (missing)
          SQL: INTERMEDIATE (2) -> gap: 0 (mastered)
          MySQL: INTERMEDIATE (2) -> gap: 2 (missing)
        """
        skills = [
            {"skill": {"name": "Java"}, "level": "INTERMEDIATE"},
            {"skill": {"name": "SQL"}, "level": "ADVANCED"},
        ]
        res = analyze_skill_gaps_and_recommend(
            self.sample_employee, skills, "Backend Developer", self.sample_courses
        )

        self.assertEqual(res.summary.totalRequiredSkills, 4)
        self.assertEqual(res.summary.masteredSkillsCount, 1)  # SQL
        self.assertEqual(res.summary.needsImprovementCount, 1)  # Java
        self.assertEqual(res.summary.missingSkillsCount, 2)  # Spring Boot, MySQL

        # Java has a matching course, Spring Boot and MySQL do not
        course_names = [c.courseName for c in res.recommendedCourses]
        self.assertIn("Advanced Java Programming", course_names)

        # Check gaps
        gap_map = {g.skillName: g for g in res.skillGaps}
        self.assertEqual(gap_map["SQL"].gapType, "MASTERED")
        self.assertEqual(gap_map["Java"].gapType, "NEEDS_IMPROVEMENT")
        self.assertEqual(gap_map["Spring Boot"].gapType, "MISSING")
        self.assertEqual(gap_map["MySQL"].gapType, "MISSING")
        self.assertFalse(gap_map["Spring Boot"].hasMatchingCourse)

    def test_scenario_1_employee_has_all_required_skills(self):
        """Employee has met or exceeded all required skills."""
        skills = [
            {"skill": {"name": "Java"}, "level": "EXPERT"},
            {"skill": {"name": "Spring Boot"}, "level": "ADVANCED"},
            {"skill": {"name": "SQL"}, "level": "ADVANCED"},
            {"skill": {"name": "MySQL"}, "level": "INTERMEDIATE"},
        ]
        res = analyze_skill_gaps_and_recommend(
            self.sample_employee, skills, "Backend Developer", self.sample_courses
        )

        self.assertEqual(res.summary.masteredSkillsCount, 4)
        self.assertEqual(res.summary.needsImprovementCount, 0)
        self.assertEqual(res.summary.missingSkillsCount, 0)
        self.assertEqual(res.summary.recommendedCoursesCount, 0)
        self.assertEqual(res.summary.roleReadinessPercentage, 100.0)

    def test_scenario_3_employee_missing_all_required_skills(self):
        """Employee has no skills assigned at all."""
        res = analyze_skill_gaps_and_recommend(
            self.sample_employee, [], "Frontend Developer", self.sample_courses
        )
        self.assertEqual(res.summary.missingSkillsCount, 4)
        self.assertEqual(res.summary.masteredSkillsCount, 0)
        self.assertEqual(res.summary.roleReadinessPercentage, 0.0)

        # React has a course in self.sample_courses, JavaScript / HTML / CSS do not
        gap_map = {g.skillName: g for g in res.skillGaps}
        self.assertTrue(gap_map["React"].hasMatchingCourse)
        self.assertFalse(gap_map["JavaScript"].hasMatchingCourse)

    def test_scenario_4_no_matching_course_exists(self):
        """When courses list is completely empty, all gaps should clearly indicate no matching course."""
        skills = [{"skill": {"name": "Python"}, "level": "BEGINNER"}]
        res = analyze_skill_gaps_and_recommend(
            self.sample_employee, skills, "Data Analyst", []
        )
        self.assertEqual(res.summary.recommendedCoursesCount, 0)
        for gap in res.skillGaps:
            self.assertFalse(gap.hasMatchingCourse)


if __name__ == "__main__":
    unittest.main()
