import { NavLink } from "react-router-dom";

function Sidebar() {
    const links = [
        { name: "Dashboard", path: "/" },
        { name: "Employees", path: "/employees" },
        { name: "Skills", path: "/skills" },
        { name: "Employee Skills", path: "/employee-skills" },
        { name: "Certifications", path: "/certifications" },
        { name: "Trainings", path: "/trainings" }
    ];

    return (
        <div className="sidebar">
            <h2>Skill Management</h2>

            <nav>
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        {link.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}

export default Sidebar;