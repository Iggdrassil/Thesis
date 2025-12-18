package controllers;

import database.DAO.EmailSettingsDAO;
import database.models.EmailSettings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import services.IncidentNotificationService;

@Slf4j
@Controller
@RequestMapping("/notifications/email")
@Tag(name = "Email", description = "API для работы с оповещением по email")
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
    @Operation(summary = "Открыть страницу настроек оповещения по email")
    public String settingsPage() {
        return "notification"; // notification.html в templates/
    }

    // Получение текущих настроек
    @ResponseBody
    @GetMapping("/settings")
    @Operation(summary = "Получить текущие настройки оповещения по email")
    public EmailSettings getSettings() {
        log.info("Getting current email settings");

        return settingsDAO.load();
    }

    // Обновление настроек
    @ResponseBody
    @PutMapping("/updateSettings")
    @Operation(summary = "Обновить текущие настройки оповещения по email")
    public ResponseEntity<?> updateSettings(@RequestBody EmailSettings settings) {
        log.info("Updating email settings");

        settingsDAO.save(settings);
        return ResponseEntity.ok().build();
    }

    // Отправка тестового письма
    @ResponseBody
    @PostMapping("/test")
    @Operation(summary = "Отправить тестовое оповещение по email")
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