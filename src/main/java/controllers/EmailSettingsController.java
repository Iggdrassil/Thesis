package controllers;

import database.DAO.EmailSettingsDAO;
import database.models.EmailSettings;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import services.IncidentNotificationService;

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
        return settingsDAO.load();
    }

    // Обновление настроек
    @ResponseBody
    @PutMapping("/updateSettings")
    public ResponseEntity<?> updateSettings(@RequestBody EmailSettings settings) {
        settingsDAO.save(settings);
        return ResponseEntity.ok().build();
    }

    // Отправка тестового письма
    @ResponseBody
    @PostMapping("/test")
    public ResponseEntity<String> testEmail() {
        String result = notificationService.sendTestEmail();

        if (result.startsWith("Тестовое письмо отправлено успешно")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
    }

}