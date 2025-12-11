package other;

import database.DAO.IncidentDAO;
import database.DAO.UserDAO;
import database.Database;
import enums.IncidentCategory;
import enums.IncidentLevel;
import enums.UserRole;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.SQLException;
import java.util.List;

import static org.apache.commons.lang3.RandomStringUtils.secure;


public class TestGenerator {
    public static void main(String[] args) throws SQLException {
        Database database = new Database("jdbc:sqlite:database.db");
        UserDAO userDAO = new UserDAO(database, new BCryptPasswordEncoder());
        IncidentDAO incidentDAO = new IncidentDAO(database);


        for (int i = 0; i < 30; i++) {
            incidentDAO.addIncident(secure().nextAlphabetic(6), secure().nextAlphabetic(6), secure().nextAlphabetic(6),
                    IncidentCategory.DDOS, IncidentLevel.HIGH, List.of());
            userDAO.addUser(secure().nextAlphabetic(6), secure().nextAlphabetic(6), UserRole.USER);
        }
    }
}
