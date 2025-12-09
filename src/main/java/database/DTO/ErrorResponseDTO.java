package database.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ErrorResponseDTO {

    private final String error;
    private final String message;

    /**
     * Конструктор для ENUM ошибок любого типа,
     * если enum имеет методы name() и getMessage().
     */
    public <E extends Enum<E>> ErrorResponseDTO(E errorEnum, String message) {
        this.error = errorEnum.name();
        this.message = message;
    }
}
