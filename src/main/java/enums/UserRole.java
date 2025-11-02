package enums;

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
}
