package queue_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import queue_management.entity.User;
import queue_management.repository.UserRepository;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User addUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User user) {

        System.out.println("EMAIL: " + user.getEmail());
        System.out.println("PASSWORD: " + user.getPassword());

        return userRepository
                .findByEmailAndPassword(
                        user.getEmail(),
                        user.getPassword()
                )
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );
    }
}