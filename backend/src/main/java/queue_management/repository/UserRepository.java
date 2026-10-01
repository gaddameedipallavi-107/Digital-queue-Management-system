package queue_management.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import queue_management.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndPassword(
            String email,
            String password
    );
}