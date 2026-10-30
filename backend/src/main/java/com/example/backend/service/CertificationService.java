package com.example.backend.service;

import com.example.backend.entity.Certification;
import com.example.backend.repository.CertificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CertificationService {

    private final CertificationRepository repository;

    public CertificationService(CertificationRepository repository) {
        this.repository = repository;
    }

    public Certification addCertification(Certification certification) {
        return repository.save(certification);
    }

    public List<Certification> getAllCertifications() {
        return repository.findAll();
    }

    public Certification getCertification(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Certification updateCertification(Long id, Certification certification) {
        Certification old = repository.findById(id).orElse(null);

        if (old == null) {
            return null;
        }

        old.setName(certification.getName());
        old.setIssuingOrganization(certification.getIssuingOrganization());
        old.setIssueDate(certification.getIssueDate());
        old.setExpiryDate(certification.getExpiryDate());
        old.setEmployee(certification.getEmployee());

        return repository.save(old);
    }

    public void deleteCertification(Long id) {
        repository.deleteById(id);
    }
}