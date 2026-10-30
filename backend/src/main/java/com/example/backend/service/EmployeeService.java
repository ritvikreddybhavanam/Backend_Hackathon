package com.example.backend.service;

import com.example.backend.entity.Employee;
import com.example.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public Employee addEmployee(Employee employee) {
        return repository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    public Employee getEmployee(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Employee updateEmployee(Long id, Employee employee) {
        Employee old = repository.findById(id).orElse(null);

        if (old == null) {
            return null;
        }

        old.setName(employee.getName());
        old.setEmail(employee.getEmail());
        old.setDepartment(employee.getDepartment());
        old.setDesignation(employee.getDesignation());
        old.setPhone(employee.getPhone());

        return repository.save(old);
    }

    public void deleteEmployee(Long id) {
        repository.deleteById(id);
    }
}