package database.models;

import enums.IncidentCategory;
import enums.IncidentLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailSettings {
    private boolean enabled;

    private String smtpHost;
    private int smtpPort;
    private String smtpUsername;
    private String smtpPassword;

    private String recipientEmail;

    private boolean notifyAll;        // если true — слать обо всём
    private List<IncidentLevel> allowedLevels;
    private List<IncidentCategory> allowedCategories;
}

