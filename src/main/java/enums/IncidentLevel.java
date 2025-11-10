package enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum IncidentLevel {

    HIGH("Высокий", 1),
    MEDIUM("Средний", 2),
    LOW("Низкий", 3);

    private final String name;
    private final int level;
}
