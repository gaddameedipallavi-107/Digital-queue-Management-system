package queue_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import queue_management.entity.Service;
import queue_management.repository.ServiceRepository;

@RestController
@RequestMapping("/services")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://digital-queue-frontend-1enz.onrender.com"
        
})
public class ServiceController {

    private final ServiceRepository serviceRepository;

    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public List<Service> getServices() {
        return serviceRepository.findAll();
    }

    @PostMapping
    public Service addService(@RequestBody Service service) {
        return serviceRepository.save(service);
    }
}
