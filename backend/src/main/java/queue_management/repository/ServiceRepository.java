package queue_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import queue_management.entity.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}