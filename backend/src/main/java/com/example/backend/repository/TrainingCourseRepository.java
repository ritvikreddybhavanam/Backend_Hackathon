package com.example.backend.repository;

import com.example.backend.entity.TrainingCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingCourseRepository extends JpaRepository<TrainingCourse, Long> {
}