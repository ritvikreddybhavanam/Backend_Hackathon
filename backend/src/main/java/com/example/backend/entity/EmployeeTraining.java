package com.example.backend.entity;

import com.example.backend.enums.TrainingStatus;
import jakarta.persistence.*;

@Entity
public class EmployeeTraining {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Employee employee;

    @ManyToOne
    private TrainingCourse course;

    @Enumerated(EnumType.STRING)
    private TrainingStatus status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public TrainingCourse getCourse() {
        return course;
    }

    public void setCourse(TrainingCourse course) {
        this.course = course;
    }

    public TrainingStatus getStatus() {
        return status;
    }

    public void setStatus(TrainingStatus status) {
        this.status = status;
    }
}