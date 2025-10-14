package com.adao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CleaningServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CleaningServiceApplication.class, args);
    }
}

