
import { useEffect, useState } from "react";
import api from "../services/api";

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        department: "",
        designation: "",
        phone: ""
    });
    const [editId, setEditId] = useState(null);

    const loadEmployees = async () => {
        try {
            const response = await api.get("/employees");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error loading employees:", error);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editId) {
                await api.put(`/employees/${editId}`, form);
            } else {
                await api.post("/employees", form);
            }

            setForm({
                name: "",
                email: "",
                department: "",
                designation: "",
                phone: ""
            });

            setEditId(null);
            loadEmployees();
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Unable to save employee. Check the backend.");
        }
    };

    const handleEdit = (employee) => {
        setForm({
            name: employee.name || "",
            email: employee.email || "",
            department: employee.department || "",
            designation: employee.designation || "",
            phone: employee.phone || ""
        });
        setEditId(employee.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this employee?")) return;

        try {
            await api.delete(`/employees/${id}`);
            loadEmployees();
        } catch (error) {
            console.error("Error deleting employee:", error);
            alert("Unable to delete employee.");
        }
    };

    return (
        <div>
            <h1>Employees</h1>
            <p>Manage employee profiles.</p>

            <form className="employee-form" onSubmit={handleSubmit}>
                <input name="name" placeholder="Employee Name" value={form.name} onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
                <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} />
                <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />

                <button type="submit">
                    {editId ? "Update Employee" : "Add Employee"}
                </button>

                {editId && (
                    <button type="button" onClick={() => {
                        setEditId(null);
                        setForm({
                            name: "",
                            email: "",
                            department: "",
                            designation: "",
                            phone: ""
                        });
                    }}>
                        Cancel
                    </button>
                )}
            </form>

            <h2>Employee List</h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                <td>{employee.id}</td>
                                <td>{employee.name}</td>
                                <td>{employee.email}</td>
                                <td>{employee.department}</td>
                                <td>{employee.designation}</td>
                                <td>{employee.phone}</td>
                                <td>
                                    <button onClick={() => handleEdit(employee)}>Edit</button>
                                    <button onClick={() => handleDelete(employee.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Employees;
