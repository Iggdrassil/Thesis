package services;

import database.DAO.AuditDAO;
import database.DTO.AuditRecordDto;
import enums.AuditEventType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class AuditService {

    private final AuditDAO auditDAO;

    public AuditService(AuditDAO auditDAO) {
        this.auditDAO = auditDAO;
    }

    public void logEvent(AuditEventType type, String username, Object... args) {
        AuditRecordDto dto = new AuditRecordDto();
        dto.id = UUID.randomUUID().toString();
        dto.eventType = type.name();
        dto.title = type.getTitle();
        dto.description = type.format(args);
        dto.username = username;
        dto.creationDatetime = LocalDateTime.now().toString();

        auditDAO.addRecord(dto);
    }
}

