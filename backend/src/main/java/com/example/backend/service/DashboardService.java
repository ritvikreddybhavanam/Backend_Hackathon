package com.example.backend.service;

import com.example.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final CertificationRepository certificationRepository;
    private final TrainingCourseRepository trainingCourseRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;

    public DashboardService(
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository,
            EmployeeSkillRepository employeeSkillRepository,
            CertificationRepository certificationRepository,
            TrainingCourseRepository trainingCourseRepository,
            EmployeeTrainingRepository employeeTrainingRepository) {

        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.certificationRepository = certificationRepository;
        this.trainingCourseRepository = trainingCourseRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
    }

    public Map<String, Long> getDashboardData() {

        Map<String, Long> data = new HashMap<>();

        data.put("totalEmployees", employeeRepository.count());
        data.put("totalSkills", skillRepository.count());
        data.put("totalEmployeeSkills", employeeSkillRepository.count());
        data.put("totalCertifications", certificationRepository.count());
        data.put("totalTrainingCourses", trainingCourseRepository.count());
        data.put("totalEnrollments", employeeTrainingRepository.count());

        return data;
    }
}