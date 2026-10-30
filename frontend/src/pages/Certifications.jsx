
import { useEffect, useState } from "react";
import api from "../services/api";

function Certifications() {
    const [employees, setEmployees] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [editId, setEditId] = useState(null);

    const emptyForm = {
        name: "",
        issuingOrganization: "",
        issueDate: "",
        expiryDate: "",
        employee: { id: "" }
    };

    const [form, setForm] = useState(emptyForm);

    const loadData = async () => {
        try {
            const [employeeResponse, certificationResponse] =
                await Promise.all([
                    api.get("/employees"),
                    api.get("/certifications")
                ]);

            setEmployees(employeeResponse.data);
            setCertifications(certificationResponse.data);
        } catch (error) {
            console.error("Error loading certifications:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            employee: { id: Number(form.employee.id) }
        };

        try {
            if (editId) {
                await api.put(`/certifications/${editId}`, payload);
            } else {
                await api.post("/certifications", payload);
            }

            setForm(emptyForm);
            setEditId(null);
            loadData();
        } catch (error) {
            console.error("Error saving certification:", error);
            alert("Unable to save certification.");
        }
    };

    const handleEdit = (item) => {
        setForm({
            name: item.name || "",
            issuingOrganization: item.issuingOrganization || "",
            issueDate: item.issueDate || "",
            expiryDate: item.expiryDate || "",
            employee: { id: item.employee?.id || "" }
        });

        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this certification?")) return;

        try {
            await api.delete(`/certifications/${id}`);
            loadData();
        } catch (error) {
            console.error("Error deleting certification:", error);
            alert("Unable to delete certification.");
        }
    };

    return (
        <div>
            <h1>Certifications</h1>
            <p>Manage employee certifications and validity dates.</p>

            <form className="employee-form" onSubmit={handleSubmit}>
                <input
                    name="name"
                    placeholder="Certification Name"
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                    required
                />

                <input
                    name="issuingOrganization"
                    placeholder="Issuing Organization"
                    value={form.issuingOrganization}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            issuingOrganization: e.target.value
                        })
                    }
                    required
                />

                <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) =>
                        setForm({ ...form, issueDate: e.target.value })
                    }
                    required
                />

                <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                        setForm({ ...form, expiryDate: e.target.value })
                    }
                />

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

                <button type="submit">
                    {editId ? "Update Certification" : "Add Certification"}
                </button>

                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setForm(emptyForm);
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <h2>Certification Records</h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Certification</th>
                            <th>Organization</th>
                            <th>Issue Date</th>
                            <th>Expiry Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {certifications.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.employee?.name}</td>
                                <td>{item.name}</td>
                                <td>{item.issuingOrganization}</td>
                                <td>{item.issueDate}</td>
                                <td>{item.expiryDate || "N/A"}</td>
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

                        {certifications.length === 0 && (
                            <tr>
                                <td colSpan="7">No certifications available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Certifications;
