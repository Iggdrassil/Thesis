package enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum UserRole {
    ADMIN("Администратор ИБ"),
    USER("Пользователь"),
    AUDITOR("Аудитор");

    private final String roleName;

    UserRole(String roleName) {
        this.roleName = roleName;
    }

    @JsonValue
    public String getRoleName() {
        return roleName;
    }

    @JsonCreator
    public static UserRole fromString(String value) {
        return switch (value.toUpperCase()) {
            case "ADMIN", "АДМИНИСТРАТОР ИБ" -> ADMIN;
            case "USER", "ПОЛЬЗОВАТЕЛЬ" -> USER;
            case "AUDITOR", "АУДИТОР" -> AUDITOR;
            default -> throw new IllegalArgumentException("Unknown role: " + value);
        };
    }
}
