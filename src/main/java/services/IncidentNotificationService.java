package services;

import database.DAO.EmailSettingsDAO;
import database.models.EmailSettings;
import database.models.Incident;
import enums.IncidentRecommendation;
import jakarta.mail.MessagingException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

import static enums.AuditEventType.SEND_EMAIL_FAIL;
import static enums.AuditEventType.SEND_EMAIL_SUCCESS;

@Service
@Component
public class IncidentNotificationService {

    private final EmailSettingsDAO settingsDAO;
    private final EmailService emailService;
    private final AuditService auditService;

    public IncidentNotificationService(EmailSettingsDAO settingsDAO, EmailService emailService, AuditService auditService) {
        this.settingsDAO = settingsDAO;
        this.emailService = emailService;
        this.auditService = auditService;
    }

    public void notifyIfNeeded(Incident incident, String username) {
        EmailSettings emailSettings = settingsDAO.load();

        if (!emailSettings.isEnabled()) return;

        if (!emailSettings.isNotifyAll()) {
            if (!emailSettings.getAllowedLevels().contains(incident.getIncidentLevel())) return;
            if (!emailSettings.getAllowedCategories().contains(incident.getIncidentCategory())) return;
        }

        String subject = String.format("Новый инцидент: %s, уровень важности: %s", incident.getTitle(), incident.getIncidentLevel().getLabel());

        String body = """
                Создан новый инцидент:

                Название: %s
                Уровень: %s
                Категория: %s
                Дата создания: %s
                Дата обновления: %s
                Автор: %s

                Описание:
                %s

                Рекомендации:
                %s
                """.formatted(
                incident.getTitle(),
                incident.getIncidentLevel().getLabel(),
                incident.getIncidentCategory().getLabel(),
                incident.getCreationDate(),
                incident.getUpdatedDate(),
                incident.getAuthor(),
                incident.getDescription(),
                incident.getIncidentRecommendations()
                        .stream()
                        .map(IncidentRecommendation::getLabel)
                        .collect(Collectors.joining("\n"))
        );

        try {
            emailService.sendEmail(emailSettings, subject, body);
            auditService.logEvent(SEND_EMAIL_SUCCESS, username, emailSettings.getRecipientEmail());
        } catch (Exception e) {
            auditService.logEvent(SEND_EMAIL_FAIL, username, emailSettings.getRecipientEmail());
            e.printStackTrace();
        }
    }

    public String sendTestEmail() {
        EmailSettings s = settingsDAO.load();

        // Если оповещения отключены
        if (!s.isEnabled()) return "Оповещения отключены";

        try {
            emailService.sendEmail(s,
                    "Тестовое уведомление",
                    "Это тестовое письмо для проверки настроек оповещений.");
            return "Тестовое письмо отправлено успешно";
        } catch (MessagingException e) {
            // Возвращаем детальное сообщение об ошибке SMTP
            return "Ошибка отправки письма: " + e.getMessage();
        } catch (Exception e) {
            return "Общая ошибка: " + e.getMessage();
        }
    }

}

