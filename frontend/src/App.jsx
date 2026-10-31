import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Skills from "./pages/Skills";
import EmployeeSkills from "./pages/EmployeeSkills";
import Certifications from "./pages/Certifications";
import Trainings from "./pages/Trainings";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";

function App() {
    return (
        <BrowserRouter>
            <div className="layout">
                <Sidebar />

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/skills" element={<Skills />} />
                        <Route path="/employee-skills" element={<EmployeeSkills />} />
                        <Route path="/certifications" element={<Certifications />} />
                        <Route path="/trainings" element={<Trainings />} />
                        <Route path="/skill-gap-analysis" element={<SkillGapAnalysis />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
