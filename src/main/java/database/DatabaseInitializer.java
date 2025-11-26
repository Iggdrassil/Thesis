package database;

import database.DAO.UserDAO;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import static enums.UserRole.ADMIN;

@Component
public class DatabaseInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);
    private final Database database;
    private final UserDAO userDAO;

    public DatabaseInitializer(Database database, UserDAO userDAO) {
        this.database = database;
        this.userDAO = userDAO;
    }

    // Этот метод будет вызван Spring автоматически после создания бина
    @PostConstruct
    public void initialize() {
        log.info("Initializing Database...");
        try (Connection conn = database.createConnection();
             Statement stmt = conn.createStatement()) {
            log.info("Creating \"users\" table if not exists");
            String sqlUsers = "CREATE TABLE IF NOT EXISTS users (" +
                    " id INTEGER PRIMARY KEY AUTOINCREMENT," +
                    "username TEXT NOT NULL UNIQUE," +
                    "password TEXT NOT NULL," +
                    "role TEXT NOT NULL CHECK(role IN ('ADMIN','USER','AUDITOR'))" +
                    ");";
            stmt.execute(sqlUsers);
            log.info("Table \"users\" created or already exists");

            // Создание таблицы инцидентов
            log.info("Creating \"incidents\" table if not exists");
            String sqlIncidents = "CREATE TABLE IF NOT EXISTS incidents (" +
                    "id TEXT PRIMARY KEY, " + // UUID в виде строки
                    "title TEXT NOT NULL, " +
                    "description TEXT, " +
                    "author TEXT NOT NULL, " +
                    "creation_date TEXT NOT NULL, " + // LocalDate как ISO-строка
                    "updated_date TEXT, " +
                    "incident_category TEXT NOT NULL, " +
                    "incident_level TEXT NOT NULL, " +
                    "incident_recommendations TEXT" + // Храним как JSON или CSV
                    ");";
            stmt.execute(sqlIncidents);
            log.info("Table \"incidents\" created or already exists");

            log.info("Creating \"audit_log\" table if not exists");
            String sqlAudit = """
                    CREATE TABLE IF NOT EXISTS audit_log (
                        id TEXT PRIMARY KEY,
                        event_type TEXT NOT NULL,
                        title TEXT NOT NULL,
                        description TEXT NOT NULL,
                        username TEXT NOT NULL,
                        creation_datetime TEXT NOT NULL
                    );
                    """;

            stmt.execute(sqlAudit);
            log.info("Table \"audit_log\" created or already exists");


            creatingDefaultAdmin();

        } catch (SQLException e) {
            log.error(e.getMessage());
        }
    }

    // Создание пользователя admin с ролью ADMIN, если его нет
    private void creatingDefaultAdmin() {
        try {
            if (!userDAO.isUserExists("admin")) {
                userDAO.addUser("admin", "admin", ADMIN);
            } else {
                log.info("Default admin user already exists");
            }
        } catch (Exception e) {
            log.error("Error creating default admin: {}", e.getMessage());
        }
    }
}

