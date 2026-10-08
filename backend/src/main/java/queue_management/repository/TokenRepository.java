package queue_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import queue_management.entity.Token;

public interface TokenRepository extends JpaRepository<Token, Long> {

    List<Token> findByServiceIdAndStatusOrderByTokenNumberAsc(
            Long serviceId,
            String status
    );

    Token findFirstByServiceIdAndStatusOrderByTokenNumberAsc(
            Long serviceId,
            String status
    );
}