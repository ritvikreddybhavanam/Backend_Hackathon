
import { useEffect, useState } from "react";
import api from "../services/api";

function EmployeeSkills() {
    const [employees, setEmployees] = useState([]);
    const [skills, setSkills] = useState([]);
    const [employeeSkills, setEmployeeSkills] = useState([]);

    const [form, setForm] = useState({
        employee: { id: "" },
        skill: { id: "" },
        level: "BEGINNER"
    });

    const [editId, setEditId] = useState(null);

    const loadData = async () => {
        try {
            const [employeeResponse, skillResponse, assignmentResponse] =
                await Promise.all([
                    api.get("/employees"),
                    api.get("/skills"),
                    api.get("/employee-skills")
                ]);

            setEmployees(employeeResponse.data);
            setSkills(skillResponse.data);
            setEmployeeSkills(assignmentResponse.data);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            employee: { id: Number(form.employee.id) },
            skill: { id: Number(form.skill.id) },
            level: form.level
        };

        try {
            if (editId) {
                await api.put(`/employee-skills/${editId}`, payload);
            } else {
                await api.post("/employee-skills", payload);
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error("Error saving employee skill:", error);
            alert("Unable to save employee skill.");
        }
    };

    const resetForm = () => {
        setForm({
            employee: { id: "" },
            skill: { id: "" },
            level: "BEGINNER"
        });
        setEditId(null);
    };

    const handleEdit = (item) => {
        setForm({
            employee: { id: item.employee?.id || "" },
            skill: { id: item.skill?.id || "" },
            level: item.level
        });
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this employee skill?")) return;

        try {
            await api.delete(`/employee-skills/${id}`);
            loadData();
        } catch (error) {
            console.error("Error deleting employee skill:", error);
            alert("Unable to delete employee skill.");
        }
    };

    return (
        <div>
            <h1>Employee Skills</h1>
            <p>Assign skills and proficiency levels to employees.</p>

            <form className="employee-form" onSubmit={handleSubmit}>
                <select
                    value={form.employee.id}
                    onChange={(e) =>
                        setForm({
                            ...form,
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
                    value={form.skill.id}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            skill: { id: e.target.value }
                        })
                    }
                    required
                >
                    <option value="">Select Skill</option>
                    {skills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                            {skill.name}
                        </option>
                    ))}
                </select>

                <select
                    value={form.level}
                    onChange={(e) =>
                        setForm({ ...form, level: e.target.value })
                    }
                >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                </select>

                <button type="submit">
                    {editId ? "Update Skill Level" : "Assign Skill"}
                </button>

                {editId && (
                    <button type="button" onClick={resetForm}>
                        Cancel
                    </button>
                )}
            </form>

            <h2>Employee Skill Assignments</h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Skill</th>
                            <th>Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {employeeSkills.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.employee?.name}</td>
                                <td>{item.skill?.name}</td>
                                <td>{item.level}</td>
                                <td>
                                    <button onClick={() => handleEdit(item)}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(item.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {employeeSkills.length === 0 && (
                            <tr>
                                <td colSpan="5">No assignments available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EmployeeSkills;
