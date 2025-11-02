package database.DAO;

import database.Database;
import database.models.User;
import enums.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
@Component
public class UserDAO {

    private static final Logger log = LoggerFactory.getLogger(UserDAO.class);

    private final Database database;

    public UserDAO(Database database) {
        this.database = database;
    }

    // Добавление пользователя
    public Optional<User> addUser(String username, String password, UserRole role) {
        log.info("Adding user {} with password {} and role {}", username, password, role);
        String sql = "INSERT INTO users(username, password, role) VALUES (?, ?, ?)";
        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, username);
            stmt.setString(2, password);
            stmt.setString(3, role.name());

            log.info("Executing SQL: {}", stmt);

            int affectedRows = stmt.executeUpdate();

            if (affectedRows == 0) {
                log.warn("User not added: {}", username);
                return Optional.empty();
            }

            ResultSet generatedKeys = stmt.getGeneratedKeys();
            int id = 0;
            if (generatedKeys.next()) {
                id = generatedKeys.getInt(1);
            }

            log.info("User {} with password {} and role {} was added successfully", username, password, role);
            return Optional.of(new User(id, username, password, role));

        } catch (SQLException e) {
            log.error("Error adding user {}: {}", username, e.getMessage());
            return Optional.empty();
        }
    }

    // Удаление пользователя
    public Optional<User> deleteUser(String username) {
        log.info("Deleting user {}", username);
        Optional<User> userOpt = getUserByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        String sql = "DELETE FROM users WHERE username = ?";
        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            stmt.executeUpdate();
            log.info("Executing SQL: {}", stmt);
            log.info("User {} with name was deleted successfully", username);
            return userOpt;
        } catch (SQLException e) {
            log.error("Error deleting user {}: {}", username, e.getMessage());
            return Optional.empty();
        }
    }

    // Редактирование пользователя (пароль и роль)
    public Optional<User> editUser(String username, String newPassword, UserRole newRole) {
        log.info("Editing user {}", username);
        Optional<User> userOpt = getUserByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        String sql = "UPDATE users SET password = ?, role = ? WHERE username = ?";
        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newPassword);
            stmt.setString(2, newRole.name());
            stmt.setString(3, username);

            log.info("Executing SQL: {}", stmt);
            stmt.executeUpdate();

            log.info("User {} with name was edited successfully", username);
            return Optional.of(new User(userOpt.get().getId(), username, newPassword, newRole));

        } catch (SQLException e) {
            log.error("Error editing user {}: {}", username, e.getMessage());
            return Optional.empty();
        }
    }

    // Проверка существования пользователя
    public boolean isUserExists(String username) {
        return getUserByUsername(username).isPresent();
    }

    // Вспомогательный метод для получения пользователя по имени
    public Optional<User> getUserByUsername(String username) {
        String sql = "SELECT id, username, password, role FROM users WHERE username = ?";
        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);

            log.info("Executing SQL: {}", stmt);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                int id = rs.getInt("id");
                String password = rs.getString("password");
                UserRole role = UserRole.valueOf(rs.getString("role"));
                return Optional.of(new User(id, username, password, role));
            }

        } catch (SQLException e) {
            log.error("Error fetching user {}: {}", username, e.getMessage());
        }
        return Optional.empty();
    }

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT id, username, password, role FROM users ORDER BY id";

        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                int id = rs.getInt("id");
                String username = rs.getString("username");
                String password = rs.getString("password");
                UserRole role = UserRole.valueOf(rs.getString("role"));
                users.add(new User(id, username, password, role));
            }

        } catch (SQLException e) {
            log.error("Error fetching all users: {}", e.getMessage());
        }
        return users;
    }
}
