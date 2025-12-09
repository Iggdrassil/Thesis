package database;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

@Slf4j
@Component
public class Database {

    private final String url;

    public Database(@Value("${app.database.url}") String url) {
        this.url = url;
    }

    public Connection createConnection() throws SQLException {
        log.info("Creating database connection to {}", url);
        return DriverManager.getConnection(url);
    }
}
