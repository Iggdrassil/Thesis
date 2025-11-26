package database.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class AuditRecordDto {
    public String id;
    public String eventType;
    public String title;
    public String description;
    public String username;
    public String creationDatetime;
}
