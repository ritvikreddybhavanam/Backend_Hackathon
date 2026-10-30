package com.example.backend.controller;

import com.example.backend.entity.TrainingCourse;
import com.example.backend.entity.EmployeeTraining;
import com.example.backend.service.TrainingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainings")
@CrossOrigin
public class TrainingController {

    private final TrainingService service;

    public TrainingController(TrainingService service) {
        this.service = service;
    }

    @PostMapping("/courses")
    public TrainingCourse addCourse(@RequestBody TrainingCourse course) {
        return service.addCourse(course);
    }

    @GetMapping("/courses")
    public List<TrainingCourse> getAllCourses() {
        return service.getAllCourses();
    }

    @GetMapping("/courses/{id}")
    public TrainingCourse getCourse(@PathVariable Long id) {
        return service.getCourse(id);
    }

    @PutMapping("/courses/{id}")
    public TrainingCourse updateCourse(@PathVariable Long id, @RequestBody TrainingCourse course) {
        return service.updateCourse(id, course);
    }

    @DeleteMapping("/courses/{id}")
    public String deleteCourse(@PathVariable Long id) {
        service.deleteCourse(id);
        return "Training course deleted successfully";
    }

    @PostMapping("/enroll")
    public EmployeeTraining enrollEmployee(@RequestBody EmployeeTraining training) {
        return service.enrollEmployee(training);
    }

    @GetMapping("/enrollments")
    public List<EmployeeTraining> getAllEnrollments() {
        return service.getAllEnrollments();
    }

    @PutMapping("/enrollments/{id}")
    public EmployeeTraining updateEnrollment(@PathVariable Long id, @RequestBody EmployeeTraining training) {
        return service.updateEnrollment(id, training);
    }

    @DeleteMapping("/enrollments/{id}")
    public String deleteEnrollment(@PathVariable Long id) {
        service.deleteEnrollment(id);
        return "Training enrollment deleted successfully";
    }
}