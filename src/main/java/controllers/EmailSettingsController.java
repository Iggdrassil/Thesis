package controllers;

import database.DAO.EmailSettingsDAO;
import database.models.EmailSettings;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import services.IncidentNotificationService;

@Slf4j
@Controller
@RequestMapping("/notifications/email")
public class EmailSettingsController {

    private final EmailSettingsDAO settingsDAO;
    private final IncidentNotificationService notificationService;

    public EmailSettingsController(EmailSettingsDAO settingsDAO,
                                   IncidentNotificationService notificationService) {
        this.settingsDAO = settingsDAO;
        this.notificationService = notificationService;
    }

    // HTML страница настроек
    @GetMapping
    public String settingsPage() {
        return "notification"; // notification.html в templates/
    }

    // Получение текущих настроек
    @ResponseBody
    @GetMapping("/settings")
    public EmailSettings getSettings() {
        log.info("Getting current email settings");

        return settingsDAO.load();
    }

    // Обновление настроек
    @ResponseBody
    @PutMapping("/updateSettings")
    public ResponseEntity<?> updateSettings(@RequestBody EmailSettings settings) {
        log.info("Updating email settings");

        settingsDAO.save(settings);
        return ResponseEntity.ok().build();
    }

    // Отправка тестового письма
    @ResponseBody
    @PostMapping("/test")
    public ResponseEntity<String> testEmail() {
        log.info("Sending test email");

        String result = notificationService.sendTestEmail();

        boolean success = result.startsWith("Тестовое письмо отправлено успешно");

        if (success) {
            return ResponseEntity.ok("Тестовое письмо отправлено успешно.");
        } else {
            log.error("Email test failed: {}", result);

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Не удалось отправить тестовое письмо. Проверьте настройки.");
        }
    }
}