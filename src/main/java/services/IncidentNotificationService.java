package services;

import database.DAO.EmailSettingsDAO;
import database.models.EmailSettings;
import database.models.Incident;
import enums.IncidentRecommendation;
import jakarta.mail.MessagingException;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@Component
public class IncidentNotificationService {

    private final EmailSettingsDAO settingsDAO;
    private final EmailService emailService;

    public IncidentNotificationService(EmailSettingsDAO settingsDAO, EmailService emailService) {
        this.settingsDAO = settingsDAO;
        this.emailService = emailService;
    }

    public void notifyIfNeeded(Incident incident) {
        EmailSettings s = settingsDAO.load();

        if (!s.isEnabled()) return;

        if (!s.isNotifyAll()) {
            if (!s.getAllowedLevels().contains(incident.getIncidentLevel())) return;
            if (!s.getAllowedCategories().contains(incident.getIncidentCategory())) return;
        }

        String subject = "Новый инцидент: " + incident.getTitle();

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
            emailService.sendEmail(s, subject, body);
        } catch (Exception e) {
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

