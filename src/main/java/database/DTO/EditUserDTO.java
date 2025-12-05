package database.DTO;

import enums.UserRole;
import lombok.Data;

@Data
public class EditUserDTO {
    private String oldUsername;
    private String newUsername;
    private String newPassword;
    private UserRole newRole;
}

