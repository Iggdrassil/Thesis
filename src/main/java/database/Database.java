package database;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

@Component
public class Database {

    private static final Logger log = LoggerFactory.getLogger(Database.class);

    private final String url;

    public Database(@Value("${app.database.url}") String url) {
        this.url = url;
    }

    public Connection createConnection() throws SQLException {
        log.info("Creating database connection to {}", url);
        return DriverManager.getConnection(url);
    }
}
