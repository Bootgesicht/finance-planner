package com.bootgesicht.financeplanner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bootgesicht.financeplanner.dto.PersonRequest;
import com.bootgesicht.financeplanner.model.Person;
import com.bootgesicht.financeplanner.repository.PersonRepository;

@Service
public class PersonService {

    private PersonRepository personRepository;

    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

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

    public void createPerson(PersonRequest request) {
        Person person = new Person(
                0,
                request.getName(),
                request.getRole());

        personRepository.save(person);
    }

    public void deletePersonById(int id) {
        personRepository.deleteById(id);
    }
}