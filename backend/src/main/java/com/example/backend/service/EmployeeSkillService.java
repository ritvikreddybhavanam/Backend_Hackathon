package com.example.backend.service;

import com.example.backend.entity.EmployeeSkill;
import com.example.backend.repository.EmployeeSkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeSkillService {

    private final EmployeeSkillRepository repository;

    public EmployeeSkillService(EmployeeSkillRepository repository) {
        this.repository = repository;
    }

    public EmployeeSkill addEmployeeSkill(EmployeeSkill employeeSkill) {
        return repository.save(employeeSkill);
    }

    public List<EmployeeSkill> getAllEmployeeSkills() {
        return repository.findAll();
    }

    public EmployeeSkill getEmployeeSkill(Long id) {
        return repository.findById(id).orElse(null);
    }

    public EmployeeSkill updateEmployeeSkill(Long id, EmployeeSkill employeeSkill) {
        EmployeeSkill old = repository.findById(id).orElse(null);

        if (old == null) {
            return null;
        }

        old.setEmployee(employeeSkill.getEmployee());
        old.setSkill(employeeSkill.getSkill());
        old.setLevel(employeeSkill.getLevel());

        return repository.save(old);
    }

    public void deleteEmployeeSkill(Long id) {
        repository.deleteById(id);
    }
}