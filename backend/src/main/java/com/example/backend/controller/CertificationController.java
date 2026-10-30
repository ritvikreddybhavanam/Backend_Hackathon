package com.example.backend.controller;

import com.example.backend.entity.Certification;
import com.example.backend.service.CertificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
@CrossOrigin
public class CertificationController {

    private final CertificationService service;

    public CertificationController(CertificationService service) {
        this.service = service;
    }

    @PostMapping
    public Certification addCertification(@RequestBody Certification certification) {
        return service.addCertification(certification);
    }

    @GetMapping
    public List<Certification> getAllCertifications() {
        return service.getAllCertifications();
    }

    @GetMapping("/{id}")
    public Certification getCertification(@PathVariable Long id) {
        return service.getCertification(id);
    }

    @PutMapping("/{id}")
    public Certification updateCertification(@PathVariable Long id, @RequestBody Certification certification) {
        return service.updateCertification(id, certification);
    }

    @DeleteMapping("/{id}")
    public String deleteCertification(@PathVariable Long id) {
        service.deleteCertification(id);
        return "Certification deleted successfully";
    }
}