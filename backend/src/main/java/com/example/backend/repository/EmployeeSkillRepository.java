package com.example.backend.repository;

import com.example.backend.entity.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {
}