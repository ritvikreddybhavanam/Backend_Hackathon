
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/dashboard");
            setData(response.data);
        } catch (error) {
            setError("Unable to connect to backend. Make sure Spring Boot is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const cards = [
        { title: "Total Employees", key: "totalEmployees", path: "/employees" },
        { title: "Total Skills", key: "totalSkills", path: "/skills" },
        { title: "Employee Skills", key: "totalEmployeeSkills", path: "/employee-skills" },
        { title: "Certifications", key: "totalCertifications", path: "/certifications" },
        { title: "Training Courses", key: "totalTrainingCourses", path: "/trainings" },
        { title: "Enrollments", key: "totalEnrollments", path: "/trainings" }
    ];

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Employee Skill Management Overview</p>
                </div>

                <button onClick={loadDashboard}>Refresh</button>
            </div>

            {loading && <p>Loading dashboard...</p>}

            {error && <p className="error-message">{error}</p>}

            {data && (
                <div className="dashboard-grid">
                    {cards.map((card) => (
                        <Link
                            to={card.path}
                            className="dashboard-card"
                            key={card.key}
                        >
                            <h3>{card.title}</h3>
                            <h2>{data[card.key] ?? 0}</h2>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
