package com.example.backend.controller;

import com.example.backend.entity.Skill;
import com.example.backend.service.SkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin
public class SkillController {

    private final SkillService service;

    public SkillController(SkillService service) {
        this.service = service;
    }

    @PostMapping
    public Skill addSkill(@RequestBody Skill skill) {
        return service.addSkill(skill);
    }

    @GetMapping
    public List<Skill> getAllSkills() {
        return service.getAllSkills();
    }

    @GetMapping("/{id}")
    public Skill getSkill(@PathVariable Long id) {
        return service.getSkill(id);
    }

    @PutMapping("/{id}")
    public Skill updateSkill(@PathVariable Long id, @RequestBody Skill skill) {
        return service.updateSkill(id, skill);
    }

    @DeleteMapping("/{id}")
    public String deleteSkill(@PathVariable Long id) {
        service.deleteSkill(id);
        return "Skill deleted successfully";
    }
}