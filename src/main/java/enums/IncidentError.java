package enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum IncidentError {

    INCIDENT_NOT_FOUND("Инцидент не найден", HttpStatus.NOT_FOUND),
    INCIDENT_ALREADY_EXISTS("Инцидент с таким названием уже существует", HttpStatus.BAD_REQUEST),
    INCIDENT_CREATE_FAILED("Не удалось создать инцидент", HttpStatus.INTERNAL_SERVER_ERROR),
    INCIDENT_UPDATE_FAILED("Не удалось обновить инцидент", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_INPUT("Некорректные входные данные", HttpStatus.BAD_REQUEST);

    private final String message;
    private final HttpStatus status;
}
