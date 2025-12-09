package enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum UserError {

    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "Пользователь с таким именем уже существует"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Пользователь не найден"),
    CANNOT_DELETE_SELF(HttpStatus.FORBIDDEN, "Нельзя удалить самого себя"),
    CANNOT_RENAME_SELF(HttpStatus.FORBIDDEN, "Нельзя менять свое имя пользователя"),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "Некорректные данные запроса"),
    USER_EDIT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Не удалось обновить пользователя"),
    USER_CREATE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Ошибка создания пользователя");

    private final HttpStatus status;
    private final String message;
}
