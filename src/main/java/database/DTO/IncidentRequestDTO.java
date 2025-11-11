package database.DTO;

import enums.IncidentCategory;
import enums.IncidentLevel;
import enums.IncidentRecommendation;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class IncidentRequestDTO {
    private String title;
    private String description;
    private String author;
    private IncidentCategory category;
    private IncidentLevel level;
    private List<IncidentRecommendation> recommendations;
}
