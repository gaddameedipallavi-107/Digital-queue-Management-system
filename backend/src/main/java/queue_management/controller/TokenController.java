package queue_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import queue_management.entity.Service;
import queue_management.entity.Token;
import queue_management.entity.User;
import queue_management.repository.ServiceRepository;
import queue_management.repository.TokenRepository;
import queue_management.repository.UserRepository;

@RestController
@RequestMapping("/tokens")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class TokenController {

    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    public TokenController(
            TokenRepository tokenRepository,
            UserRepository userRepository,
            ServiceRepository serviceRepository) {

        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public List<Token> getTokens() {

        return tokenRepository.findAll();
    }

    @GetMapping("/{id}")
    public Token getToken(
            @PathVariable Long id) {

        return tokenRepository
                .findById(id)
                .orElseThrow();
    }

    @PostMapping
    public Token createToken(
            @RequestParam Long userId,
            @RequestParam Long serviceId) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow();

        Service service =
                serviceRepository
                        .findById(serviceId)
                        .orElseThrow();

        Token token = new Token();

        token.setUser(user);
        token.setService(service);
        token.setStatus("WAITING");

        List<Token> tokens =
                tokenRepository.findAll();

        token.setTokenNumber(
                tokens.size() + 1
        );

        return tokenRepository.save(token);
    }

    @GetMapping("/{id}/queue")
    public String getQueuePosition(
            @PathVariable Long id) {

        Token token =
                tokenRepository
                        .findById(id)
                        .orElseThrow();

        List<Token> waitingTokens =
                tokenRepository
                        .findByServiceIdAndStatusOrderByTokenNumberAsc(
                                token.getService().getId(),
                                "WAITING"
                        );

        int position = 1;

        for (Token t : waitingTokens) {

            if (t.getId().equals(id)) {
                break;
            }

            position++;
        }

        int waitingTime =
                (position - 1)
                * token.getService()
                        .getAverageServiceTime();

        return "Your Token: "
                + token.getTokenNumber()
                + "\nQueue Position: "
                + position
                + "\nPeople Before You: "
                + (position - 1)
                + "\nEstimated Waiting Time: "
                + waitingTime
                + " minutes";
    }

    @PutMapping("/next")
    public Token callNextToken(
            @RequestParam Long serviceId) {

        Token token =
                tokenRepository
                        .findFirstByServiceIdAndStatusOrderByTokenNumberAsc(
                                serviceId,
                                "WAITING"
                        );

        if (token == null) {

            throw new RuntimeException(
                    "No waiting tokens"
            );
        }

        token.setStatus("SERVING");

        return tokenRepository.save(token);
    }

    @GetMapping("/serving")
    public Token getServingToken(
            @RequestParam Long serviceId) {

        return tokenRepository
                .findFirstByServiceIdAndStatusOrderByTokenNumberAsc(
                        serviceId,
                        "SERVING"
                );
    }

    @PutMapping("/{id}/complete")
    public Token completeToken(
            @PathVariable Long id) {

        Token token =
                tokenRepository
                        .findById(id)
                        .orElseThrow();

        token.setStatus("COMPLETED");

        return tokenRepository.save(token);
    }

    @PutMapping("/{id}/transfer")
    public Token transferToken(
            @PathVariable Long id,
            @RequestParam Long serviceId) {

        Token token =
                tokenRepository
                        .findById(id)
                        .orElseThrow();

        if (!token.getStatus().equals("WAITING")) {

            throw new RuntimeException(
                    "Only waiting tokens can be transferred"
            );
        }

        Service newService =
                serviceRepository
                        .findById(serviceId)
                        .orElseThrow();

        token.setService(newService);

        return tokenRepository.save(token);
    }
}