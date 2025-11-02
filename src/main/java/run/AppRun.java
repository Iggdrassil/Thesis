package run;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"run", "controllers", "database", "security"})
public class AppRun {
    public static void main(String[] args) {
        SpringApplication.run(AppRun.class, args);
    }
}