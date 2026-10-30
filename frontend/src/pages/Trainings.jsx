
import { useEffect, useState } from "react";
import api from "../services/api";

function Trainings() {
    const [employees, setEmployees] = useState([]);
    const [skills, setSkills] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [editCourseId, setEditCourseId] = useState(null);

    const emptyCourse = {
        name: "",
        description: "",
        duration: "",
        provider: "",
        skill: { id: "" }
    };

    const [courseForm, setCourseForm] = useState(emptyCourse);

    const [enrollmentForm, setEnrollmentForm] = useState({
        employee: { id: "" },
        course: { id: "" },
        status: "NOT_STARTED"
    });

    const loadData = async () => {
        try {
            const [
                employeeResponse,
                skillResponse,
                courseResponse,
                enrollmentResponse
            ] = await Promise.all([
                api.get("/employees"),
                api.get("/skills"),
                api.get("/trainings/courses"),
                api.get("/trainings/enrollments")
            ]);

            setEmployees(employeeResponse.data);
            setSkills(skillResponse.data);
            setCourses(courseResponse.data);
            setEnrollments(enrollmentResponse.data);
        } catch (error) {
            console.error("Error loading training data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCourseSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...courseForm,
            skill: { id: Number(courseForm.skill.id) }
        };

        try {
            if (editCourseId) {
                await api.put(`/trainings/courses/${editCourseId}`, payload);
            } else {
                await api.post("/trainings/courses", payload);
            }

            setCourseForm(emptyCourse);
            setEditCourseId(null);
            loadData();
        } catch (error) {
            console.error("Error saving course:", error);
            alert("Unable to save training course.");
        }
    };

    const handleCourseEdit = (course) => {
        setCourseForm({
            name: course.name || "",
            description: course.description || "",
            duration: course.duration || "",
            provider: course.provider || "",
            skill: { id: course.skill?.id || "" }
        });

        setEditCourseId(course.id);
    };

    const handleCourseDelete = async (id) => {
        if (!window.confirm("Delete this training course?")) return;

        try {
            await api.delete(`/trainings/courses/${id}`);
            loadData();
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Unable to delete course. Check whether employees are enrolled.");
        }
    };

    const handleEnrollmentSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            employee: { id: Number(enrollmentForm.employee.id) },
            course: { id: Number(enrollmentForm.course.id) },
            status: enrollmentForm.status
        };

        try {
            await api.post("/trainings/enroll", payload);

            setEnrollmentForm({
                employee: { id: "" },
                course: { id: "" },
                status: "NOT_STARTED"
            });

            loadData();
        } catch (error) {
            console.error("Error enrolling employee:", error);
            alert("Unable to enroll employee.");
        }
    };

    const handleStatusChange = async (item, status) => {
        try {
            await api.put(`/trainings/enrollments/${item.id}`, {
                employee: { id: item.employee.id },
                course: { id: item.course.id },
                status
            });

            loadData();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Unable to update training status.");
        }
    };

    const handleEnrollmentDelete = async (id) => {
        if (!window.confirm("Delete this enrollment?")) return;

        try {
            await api.delete(`/trainings/enrollments/${id}`);
            loadData();
        } catch (error) {
            console.error("Error deleting enrollment:", error);
            alert("Unable to delete enrollment.");
        }
    };

    return (
        <div>
            <h1>Training Management</h1>
            <p>Manage training courses and employee enrollments.</p>

            <h2>{editCourseId ? "Update Course" : "Add Training Course"}</h2>

            <form className="employee-form" onSubmit={handleCourseSubmit}>
                <input
                    placeholder="Course Name"
                    value={courseForm.name}
                    onChange={(e) =>
                        setCourseForm({ ...courseForm, name: e.target.value })
                    }
                    required
                />

                <input
                    placeholder="Description"
                    value={courseForm.description}
                    onChange={(e) =>
                        setCourseForm({
                            ...courseForm,
                            description: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Duration"
                    value={courseForm.duration}
                    onChange={(e) =>
                        setCourseForm({
                            ...courseForm,
                            duration: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Provider"
                    value={courseForm.provider}
                    onChange={(e) =>
                        setCourseForm({
                            ...courseForm,
                            provider: e.target.value
                        })
                    }
                />

                <select
                    value={courseForm.skill.id}
                    onChange={(e) =>
                        setCourseForm({
                            ...courseForm,
                            skill: { id: e.target.value }
                        })
                    }
                    required
                >
                    <option value="">Select Related Skill</option>
                    {skills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                            {skill.name}
                        </option>
                    ))}
                </select>

                <button type="submit">
                    {editCourseId ? "Update Course" : "Add Course"}
                </button>

                {editCourseId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditCourseId(null);
                            setCourseForm(emptyCourse);
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <h2>Training Courses</h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Course</th>
                            <th>Skill</th>
                            <th>Duration</th>
                            <th>Provider</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td>{course.id}</td>
                                <td>{course.name}</td>
                                <td>{course.skill?.name}</td>
                                <td>{course.duration}</td>
                                <td>{course.provider}</td>
                                <td>
                                    <button onClick={() => handleCourseEdit(course)}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleCourseDelete(course.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {courses.length === 0 && (
                            <tr>
                                <td colSpan="6">No courses available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <h2>Enroll Employee</h2>

            <form className="employee-form" onSubmit={handleEnrollmentSubmit}>
                <select
                    value={enrollmentForm.employee.id}
                    onChange={(e) =>
                        setEnrollmentForm({
                            ...enrollmentForm,
                            employee: { id: e.target.value }
                        })
                    }
                    required
                >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.name}
                        </option>
                    ))}
                </select>

                <select
                    value={enrollmentForm.course.id}
                    onChange={(e) =>
                        setEnrollmentForm({
                            ...enrollmentForm,
                            course: { id: e.target.value }
                        })
                    }
                    required
                >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>

                <select
                    value={enrollmentForm.status}
                    onChange={(e) =>
                        setEnrollmentForm({
                            ...enrollmentForm,
                            status: e.target.value
                        })
                    }
                >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>

                <button type="submit">Enroll Employee</button>
            </form>

            <h2>Employee Enrollments</h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Course</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {enrollments.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.employee?.name}</td>
                                <td>{item.course?.name}</td>
                                <td>
                                    <select
                                        value={item.status}
                                        onChange={(e) =>
                                            handleStatusChange(item, e.target.value)
                                        }
                                    >
                                        <option value="NOT_STARTED">Not Started</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleEnrollmentDelete(item.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {enrollments.length === 0 && (
                            <tr>
                                <td colSpan="5">No enrollments available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Trainings;
