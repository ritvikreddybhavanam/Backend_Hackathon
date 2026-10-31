package com.example.backend.controller;

import com.example.backend.entity.EmployeeSkill;
import com.example.backend.service.EmployeeSkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee-skills")
@CrossOrigin
public class EmployeeSkillController {

    private final EmployeeSkillService service;

    public EmployeeSkillController(EmployeeSkillService service) {
        this.service = service;
    }

    @PostMapping
    public EmployeeSkill addEmployeeSkill(@RequestBody EmployeeSkill employeeSkill) {
        return service.addEmployeeSkill(employeeSkill);
    }

    @GetMapping
    public List<EmployeeSkill> getAllEmployeeSkills() {
        return service.getAllEmployeeSkills();
    }

    @GetMapping("/{id}")
    public EmployeeSkill getEmployeeSkill(@PathVariable Long id) {
        return service.getEmployeeSkill(id);
    }

    @GetMapping("/employee/{employeeId}")
    public List<EmployeeSkill> getEmployeeSkillsByEmployeeId(@PathVariable Long employeeId) {
        return service.getEmployeeSkillsByEmployeeId(employeeId);
    }

    @PutMapping("/{id}")
    public EmployeeSkill updateEmployeeSkill(@PathVariable Long id, @RequestBody EmployeeSkill employeeSkill) {
        return service.updateEmployeeSkill(id, employeeSkill);
    }

    @DeleteMapping("/{id}")
    public String deleteEmployeeSkill(@PathVariable Long id) {
        service.deleteEmployeeSkill(id);
        return "Employee skill deleted successfully";
    }
}
