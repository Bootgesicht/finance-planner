package com.bootgesicht.financeplanner.service;

import java.util.List;

import com.bootgesicht.financeplanner.model.Person;
import com.bootgesicht.financeplanner.repository.PersonRepository;

public class PersonService {

    private PersonRepository personRepository = new PersonRepository();

    public List<Person> getAllPersons() {
        return personRepository.findAll();
    }

    public Person getPersonById(int id) {
        return personRepository.findById(id);
    }

    public Person getPersonByName(String name) {
        return personRepository.findByName(name);
    }

    public void createPerson(Person person) {
        personRepository.save(person);
    }

    public void deletePersonById(int id) {
        personRepository.deleteById(id);
    }
}