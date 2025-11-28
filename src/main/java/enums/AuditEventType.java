package enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
public enum AuditEventType {

    USER_LOGIN(
            "Вход пользователя",
            "Пользователь %s вошел в систему"
    ),
    USER_LOGOUT(
            "Выход пользователя",
            "Пользователь %s вышел из системы"
    ),
    USER_CREATED(
            "Создание пользователя",
            "Пользователь \"%s\" создал пользователя \"%s\" с ролью \"%s\""
    ),
    USER_DELETED(
            "Удаление пользователя",
            "Пользователь \"%s\" удалил пользователя \"%s\" с ролью \"%s\""
    ),
    INCIDENT_CREATED(
            "Создание инцидента",
            "Инцидент \"%s\" создан пользователем \"%s\""
    ),
    INCIDENT_CREATE_ERROR(
            "Создание инцидента",
            "При создании инцидента \"%s\" произошла ошибка: %s"
    ),
    INCIDENT_UPDATED(
            "Изменение инцидента",
            "Инцидент \"%s\" изменен пользователем \"%s\""
    ),
    INCIDENT_DELETED(
            "Удаление инцидента",
            "Инцидент \"%s\" удален пользователем \"%s\""
    );

    private final String title;
    private final String template;

    public String format(Object... args) {
        return template.formatted(args);
    }
}

