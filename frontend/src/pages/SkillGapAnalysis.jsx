import { useEffect, useState } from "react";
import api, { recommendationApi } from "../services/api";

const DEFAULT_ROLES = [
    { roleName: "Backend Developer" },
    { roleName: "Frontend Developer" },
    { roleName: "Data Analyst" }
];

const LEVEL_COLORS = {
    BEGINNER: "#3b82f6",
    INTERMEDIATE: "#f59e0b",
    ADVANCED: "#10b981",
    EXPERT: "#8b5cf6"
};

function SkillGapAnalysis() {
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState(DEFAULT_ROLES);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [selectedRole, setSelectedRole] = useState("Backend Developer");

    const [loadingData, setLoadingData] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [serviceWarning, setServiceWarning] = useState("");

    // Load employees from Spring Boot & roles from Python service on mount
    useEffect(() => {
        const initialize = async () => {
            setLoadingData(true);
            setErrorMessage("");
            setServiceWarning("");

            // 1. Load employees from Spring Boot
            try {
                const empRes = await api.get("/employees");
                setEmployees(empRes.data || []);
                if (empRes.data && empRes.data.length > 0) {
                    setSelectedEmployeeId(String(empRes.data[0].id));
                }
            } catch (err) {
                console.error("Failed to fetch employees from backend:", err);
                setErrorMessage("Unable to connect to Spring Boot backend (port 8080). Please ensure it is running.");
            }

            // 2. Load roles from Python recommendation service
            try {
                const rolesRes = await recommendationApi.get("/roles");
                if (Array.isArray(rolesRes.data) && rolesRes.data.length > 0) {
                    setRoles(rolesRes.data);
                    setSelectedRole(rolesRes.data[0].roleName);
                }
            } catch (err) {
                console.warn("Python recommendation service not yet responding for /roles, using default roles:", err);
                setServiceWarning("Python Recommendation Service (port 8000) was not reached. If you run analysis, ensure the service is running.");
            } finally {
                setLoadingData(false);
            }
        };

        initialize();
    }, []);

    const handleAnalyze = async (e) => {
        if (e) e.preventDefault();
        if (!selectedEmployeeId) {
            setErrorMessage("Please select an employee.");
            return;
        }

        setAnalyzing(true);
        setErrorMessage("");

        try {
            const response = await recommendationApi.post("/recommend", {
                employeeId: Number(selectedEmployeeId),
                targetRole: selectedRole
            });
            setResult(response.data);
            setServiceWarning("");
        } catch (err) {
            console.error("Skill gap analysis request failed:", err);
            if (err.response) {
                const detail = err.response.data?.detail || err.response.statusText;
                setErrorMessage(`Analysis failed (${err.response.status}): ${detail}`);
            } else if (err.request) {
                setErrorMessage("Cannot connect to Python Recommendation Service at http://localhost:8000. Please ensure the Python service is running.");
            } else {
                setErrorMessage(`Error: ${err.message}`);
            }
            setResult(null);
        } finally {
            setAnalyzing(false);
        }
    };

    const renderLevelDots = (levelNum, activeColor) => {
        const dots = [];
        for (let i = 1; i <= 4; i++) {
            const isActive = i <= levelNum;
            dots.push(
                <span
                    key={i}
                    className="level-dot"
                    style={{
                        backgroundColor: isActive ? activeColor : "#e2e8f0"
                    }}
                    title={`Level ${i} of 4`}
                />
            );
        }
        return <div className="level-dots">{dots}</div>;
    };

    return (
        <div className="skill-gap-page">
            <div className="dashboard-header">
                <div>
                    <h1>AI-Based Skill Gap Analysis & Training Recommendation</h1>
                    <p>Analyze employee proficiencies against target roles and get explainable course recommendations.</p>
                </div>
            </div>

            {serviceWarning && (
                <div className="banner-warning">
                    ⚠️ {serviceWarning}
                </div>
            )}

            {errorMessage && (
                <div className="error-message" style={{ marginBottom: "20px" }}>
                    ❌ {errorMessage}
                </div>
            )}

            {/* Selection Controls */}
            <div className="analysis-panel">
                <form className="analysis-controls" onSubmit={handleAnalyze}>
                    <div className="analysis-control-group">
                        <label htmlFor="employee-select">Select Employee:</label>
                        <select
                            id="employee-select"
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            disabled={loadingData || employees.length === 0}
                        >
                            {employees.length === 0 && <option value="">No employees available</option>}
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.department} - {emp.designation})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="analysis-control-group">
                        <label htmlFor="role-select">Target Role:</label>
                        <select
                            id="role-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            disabled={loadingData}
                        >
                            {roles.map((r) => (
                                <option key={r.roleName} value={r.roleName}>
                                    {r.roleName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={analyzing || !selectedEmployeeId}
                    >
                        {analyzing ? "Analyzing..." : "Analyze Skill Gaps"}
                    </button>
                </form>
            </div>

            {/* Results Display */}
            {analyzing && (
                <div className="empty-alert">
                    <p>⏳ Running rule-based skill gap evaluation against role requirements...</p>
                </div>
            )}

            {result && !analyzing && (
                <div>
                    {/* Readiness Overview */}
                    <div className="readiness-container">
                        <div className="readiness-header">
                            <div>
                                <span className="readiness-title">
                                    Target Role Readiness: <strong>{result.targetRole}</strong> for <strong>{result.employee.name}</strong>
                                </span>
                                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                                    {result.employee.department} • {result.employee.designation} • {result.employee.email}
                                </div>
                            </div>
                            <span className="readiness-score">
                                {result.summary.roleReadinessPercentage}% Match
                            </span>
                        </div>
                        <div className="readiness-bar-bg">
                            <div
                                className="readiness-bar-fill"
                                style={{ width: `${result.summary.roleReadinessPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Summary Statistics Cards */}
                    <div className="summary-grid">
                        <div className="stat-card">
                            <h4>Required Skills</h4>
                            <div className="stat-value">{result.summary.totalRequiredSkills}</div>
                        </div>
                        <div className="stat-card">
                            <h4>Mastered Skills</h4>
                            <div className="stat-value" style={{ color: "#16a34a" }}>
                                {result.summary.masteredSkillsCount}
                            </div>
                        </div>
                        <div className="stat-card">
                            <h4>Needs Improvement</h4>
                            <div className="stat-value" style={{ color: "#d97706" }}>
                                {result.summary.needsImprovementCount}
                            </div>
                        </div>
                        <div className="stat-card">
                            <h4>Missing Skills</h4>
                            <div className="stat-value" style={{ color: "#dc2626" }}>
                                {result.summary.missingSkillsCount}
                            </div>
                        </div>
                        <div className="stat-card">
                            <h4>Courses Recommended</h4>
                            <div className="stat-value" style={{ color: "#2563eb" }}>
                                {result.summary.recommendedCoursesCount}
                            </div>
                        </div>
                    </div>

                    {/* Skill Gap Analysis Section */}
                    <div className="section-card">
                        <h2>Skill Gap Analysis (Current vs Required)</h2>
                        <div className="table-container">
                            <table className="gap-comparison-table">
                                <thead>
                                    <tr>
                                        <th>Required Skill</th>
                                        <th>Target Role Requirement</th>
                                        <th>Employee Current Level</th>
                                        <th>Visual Comparison</th>
                                        <th>Gap Assessment</th>
                                        <th>Training Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.skillGaps.map((gap) => {
                                        let badgeClass = "badge-neutral";
                                        if (gap.gapType === "MASTERED") badgeClass = "badge-mastered";
                                        else if (gap.gapType === "NEEDS_IMPROVEMENT") badgeClass = "badge-improvement";
                                        else if (gap.gapType === "MISSING") badgeClass = "badge-missing";

                                        return (
                                            <tr key={gap.skillName}>
                                                <td>
                                                    <strong>{gap.skillName}</strong>
                                                </td>
                                                <td>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            backgroundColor: "#f1f5f9",
                                                            color: LEVEL_COLORS[gap.requiredLevel] || "#334155"
                                                        }}
                                                    >
                                                        {gap.requiredLevel} (Level {gap.requiredLevelNum})
                                                    </span>
                                                </td>
                                                <td>
                                                    {gap.currentLevelNum > 0 ? (
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                backgroundColor: "#f1f5f9",
                                                                color: LEVEL_COLORS[gap.currentLevel] || "#334155"
                                                            }}
                                                        >
                                                            {gap.currentLevel} (Level {gap.currentLevelNum})
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-missing">Missing / None</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="visual-levels">
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                <span style={{ fontSize: "11px", color: "#64748b", width: "45px" }}>Current:</span>
                                                                {renderLevelDots(gap.currentLevelNum, "#3b82f6")}
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                <span style={{ fontSize: "11px", color: "#64748b", width: "45px" }}>Required:</span>
                                                                {renderLevelDots(gap.requiredLevelNum, "#10b981")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${badgeClass}`}>
                                                        {gap.gapType.replace("_", " ")}
                                                    </span>
                                                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                                        {gap.statusDescription}
                                                    </div>
                                                </td>
                                                <td>
                                                    {gap.gapType === "MASTERED" ? (
                                                        <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Satisfied</span>
                                                    ) : gap.hasMatchingCourse ? (
                                                        <span style={{ color: "#2563eb", fontSize: "13px", fontWeight: "bold" }}>
                                                            Course Available
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: "#dc2626", fontSize: "13px", fontWeight: "bold" }}>
                                                            No suitable course in catalog
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recommended Training Courses Section */}
                    <div className="section-card">
                        <h2>Recommended Training Courses (Ranked by Skill Gap)</h2>
                        {result.recommendedCourses.length === 0 ? (
                            result.summary.masteredSkillsCount === result.summary.totalRequiredSkills ? (
                                <div className="banner-success">
                                    🎉 <strong>Excellent match!</strong> This employee already possesses all required skill proficiencies for the <strong>{result.targetRole}</strong> role. No additional training is required.
                                </div>
                            ) : (
                                <div className="empty-alert">
                                    <p>⚠️ No matching training courses are currently available in the database to bridge the identified skill gaps.</p>
                                </div>
                            )
                        ) : (
                            <div className="course-grid">
                                {result.recommendedCourses.map((c, index) => (
                                    <div key={`${c.courseId}-${index}`} className="course-card">
                                        <div className="course-card-header">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                                <div className="course-title">{c.courseName}</div>
                                                <span className="badge badge-improvement" title="Size of skill gap">
                                                    Gap: {c.gapSize} {c.gapSize === 1 ? "level" : "levels"}
                                                </span>
                                            </div>
                                            <div className="course-meta">
                                                <span>🎯 Skill: <strong>{c.skillName}</strong></span>
                                                {c.duration && <span>⏱️ {c.duration}</span>}
                                                {c.provider && <span>🏫 {c.provider}</span>}
                                            </div>
                                            {c.description && (
                                                <p style={{ fontSize: "13px", color: "#475569", margin: "6px 0 10px 0" }}>
                                                    {c.description}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", gap: "8px", fontSize: "12px", marginBottom: "8px" }}>
                                                <span className="badge badge-neutral">Current: {c.currentLevel}</span>
                                                <span style={{ alignSelf: "center", color: "#94a3b8" }}>➔</span>
                                                <span className="badge badge-mastered">Target: {c.requiredLevel}</span>
                                            </div>
                                            <div className="course-reason">
                                                <strong>Reason:</strong> {c.reason}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Side-by-side: Current Skills vs Target Role Skills */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "25px" }}>
                        <div className="section-card" style={{ marginBottom: 0 }}>
                            <h2>Employee Current Skills ({result.currentSkills.length})</h2>
                            {result.currentSkills.length === 0 ? (
                                <div className="empty-alert">
                                    <p>No skills are currently registered for this employee.</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Skill</th>
                                                <th>Current Level</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.currentSkills.map((s, idx) => (
                                                <tr key={idx}>
                                                    <td><strong>{s.skillName}</strong></td>
                                                    <td>
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                backgroundColor: "#f1f5f9",
                                                                color: LEVEL_COLORS[s.level] || "#334155"
                                                            }}
                                                        >
                                                            {s.level}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="section-card" style={{ marginBottom: 0 }}>
                            <h2>Required Skills for {result.targetRole} ({result.requiredSkills.length})</h2>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Required Skill</th>
                                            <th>Target Proficiency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.requiredSkills.map((s, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{s.skillName}</strong></td>
                                                <td>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            backgroundColor: "#f1f5f9",
                                                            color: LEVEL_COLORS[s.level] || "#334155"
                                                        }}
                                                    >
                                                        {s.level}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation Explanations Section */}
                    <div className="section-card">
                        <h2>Recommendation Explanations & Audit Trail</h2>
                        <ul className="explanations-list">
                            {result.recommendationExplanations.map((exp, idx) => (
                                <li key={idx}>{exp}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SkillGapAnalysis;
