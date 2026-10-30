package com.example.backend.service;

import com.example.backend.entity.TrainingCourse;
import com.example.backend.entity.EmployeeTraining;
import com.example.backend.repository.TrainingCourseRepository;
import com.example.backend.repository.EmployeeTrainingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainingService {

    private final TrainingCourseRepository courseRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;

    public TrainingService(TrainingCourseRepository courseRepository,
                           EmployeeTrainingRepository employeeTrainingRepository) {
        this.courseRepository = courseRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
    }

    public TrainingCourse addCourse(TrainingCourse course) {
        return courseRepository.save(course);
    }

    public List<TrainingCourse> getAllCourses() {
        return courseRepository.findAll();
    }

    public TrainingCourse getCourse(Long id) {
        return courseRepository.findById(id).orElse(null);
    }

    public TrainingCourse updateCourse(Long id, TrainingCourse course) {
        TrainingCourse old = courseRepository.findById(id).orElse(null);

        if (old == null) {
            return null;
        }

        old.setName(course.getName());
        old.setDescription(course.getDescription());
        old.setDuration(course.getDuration());
        old.setProvider(course.getProvider());
        old.setSkill(course.getSkill());

        return courseRepository.save(old);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public EmployeeTraining enrollEmployee(EmployeeTraining training) {
        return employeeTrainingRepository.save(training);
    }

    public List<EmployeeTraining> getAllEnrollments() {
        return employeeTrainingRepository.findAll();
    }

    public EmployeeTraining updateEnrollment(Long id, EmployeeTraining training) {
        EmployeeTraining old = employeeTrainingRepository.findById(id).orElse(null);

        if (old == null) {
            return null;
        }

        old.setEmployee(training.getEmployee());
        old.setCourse(training.getCourse());
        old.setStatus(training.getStatus());

        return employeeTrainingRepository.save(old);
    }

    public void deleteEnrollment(Long id) {
        employeeTrainingRepository.deleteById(id);
    }
}