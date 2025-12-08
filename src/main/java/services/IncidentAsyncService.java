package services;

import database.models.Incident;
import enums.AuditEventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@Service
public class IncidentAsyncService {

    @Autowired
    private IncidentNotificationService incidentNotificationService;

    @Autowired
    private AuditService auditService;

    @Async
    public void processAfterCreate(Incident incident, String actionUser) {
        // Лог аудит
        auditService.logEvent(
                AuditEventType.INCIDENT_CREATED,
                actionUser,
                incident.getTitle(),
                actionUser
        );

        // Отправка письма
        incidentNotificationService.notifyIfNeeded(incident, actionUser);
    }
}