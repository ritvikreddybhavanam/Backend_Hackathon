
import { useEffect, useState } from "react";
import api from "../services/api";

function Skills() {
    const [skills, setSkills] = useState([]);
    const [form, setForm] = useState({
        name: "",
        category: "",
        description: ""
    });
    const [editId, setEditId] = useState(null);

    const loadSkills = async () => {
        try {
            const response = await api.get("/skills");
            setSkills(response.data);
        } catch (error) {
            console.error("Error loading skills:", error);
        }
    };

    useEffect(() => {
        loadSkills();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editId) {
                await api.put(`/skills/${editId}`, form);
            } else {
                await api.post("/skills", form);
            }

            setForm({
                name: "",
                category: "",
                description: ""
            });

            setEditId(null);
            loadSkills();
        } catch (error) {
            console.error("Error saving skill:", error);
            alert("Unable to save skill.");
        }
    };

    const handleEdit = (skill) => {
        setForm({
            name: skill.name || "",
            category: skill.category || "",
            description: skill.description || ""
        });

        setEditId(skill.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this skill?")) return;

        try {
            await api.delete(`/skills/${id}`);
            loadSkills();
        } catch (error) {
            console.error("Error deleting skill:", error);
            alert("Unable to delete skill.");
        }
    };

    return (
        <div>
            <h1>Skills Management</h1>
            <p>Add and manage available employee skills.</p>

            <form className="employee-form" onSubmit={handleSubmit}>
                <input
                    name="name"
                    placeholder="Skill Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <input
                    name="category"
                    placeholder="Category"
                    value={form.category}
                    onChange={handleChange}
                />

                <input
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                />

                <button type="submit">
                    {editId ? "Update Skill" : "Add Skill"}
                </button>

                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setForm({
                                name: "",
                                category: "",
                                description: ""
                            });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <h2>Skills List</h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Skill Name</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {skills.map((skill) => (
                            <tr key={skill.id}>
                                <td>{skill.id}</td>
                                <td>{skill.name}</td>
                                <td>{skill.category}</td>
                                <td>{skill.description}</td>
                                <td>
                                    <button onClick={() => handleEdit(skill)}>
                                        Edit
                                    </button>

                                    <button onClick={() => handleDelete(skill.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {skills.length === 0 && (
                            <tr>
                                <td colSpan="5">No skills available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Skills;
