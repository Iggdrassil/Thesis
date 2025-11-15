package database.DTO;

import enums.IncidentCategory;
import enums.IncidentLevel;
import enums.IncidentRecommendation;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class IncidentResponseDTO {
    private UUID id;
    private String title;
    private String description;
    private String author;
    private LocalDateTime creationDate;
    private LocalDateTime updatedDate;
    private IncidentCategory category;
    private IncidentLevel level;
    private List<IncidentRecommendation> recommendations;
}
