package database.models;

import enums.IncidentCategory;
import enums.IncidentLevel;
import enums.IncidentRecommendation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class Incident {
    private UUID id;
    private String title;
    private String description;
    private String author;
    private LocalDateTime creationDate;
    private LocalDateTime updatedDate;
    private IncidentCategory incidentCategory;
    private IncidentLevel incidentLevel;
    private List<IncidentRecommendation> incidentRecommendations;
}
