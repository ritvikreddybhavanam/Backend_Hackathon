package com.example.backend.service;

import com.example.backend.entity.Skill;
import com.example.backend.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository repository;

    public SkillService(SkillRepository repository) {
        this.repository = repository;
    }

    public Skill addSkill(Skill skill) {
        return repository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return repository.findAll();
    }

    public Skill getSkill(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Skill updateSkill(Long id, Skill skill) {
        Skill old = repository.findById(id).orElse(null);

        if (old == null) {
            return null;
        }

        old.setName(skill.getName());
        old.setCategory(skill.getCategory());
        old.setDescription(skill.getDescription());

        return repository.save(old);
    }

    public void deleteSkill(Long id) {
        repository.deleteById(id);
    }
}