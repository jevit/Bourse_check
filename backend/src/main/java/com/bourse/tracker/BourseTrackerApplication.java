package com.bourse.tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class BourseTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(BourseTrackerApplication.class, args);
    }
}
