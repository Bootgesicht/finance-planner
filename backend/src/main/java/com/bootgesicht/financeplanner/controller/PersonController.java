package com.bootgesicht.financeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import com.bootgesicht.financeplanner.model.Person;
import com.bootgesicht.financeplanner.service.PersonService;

@RestController
@RequestMapping("/persons")
public class PersonController {

    private PersonService personService = new PersonService();

    @GetMapping
    public List<Person> getAllPersons() {
        return personService.getAllPersons();
    }

    @GetMapping("/{id}")
    public Person getPersonById(@PathVariable int id) {
        return personService.getPersonById(id);
    }

}