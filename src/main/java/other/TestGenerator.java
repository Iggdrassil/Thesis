package other;

import database.DAO.IncidentDAO;
import database.DAO.UserDAO;
import database.Database;
import enums.IncidentCategory;
import enums.IncidentLevel;
import org.apache.commons.lang3.RandomUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.SQLException;
import java.util.EnumSet;
import java.util.List;
import java.util.Random;

import static org.apache.commons.lang3.RandomStringUtils.secure;
import static org.apache.commons.lang3.RandomUtils.nextInt;


public class TestGenerator {
    public static void main(String[] args) throws SQLException {
        Database database = new Database("jdbc:sqlite:database.db");
        UserDAO userDAO = new UserDAO(database, new BCryptPasswordEncoder());
        IncidentDAO incidentDAO = new IncidentDAO(database);

        EnumSet<IncidentCategory> incidentCat = EnumSet.allOf(IncidentCategory.class);
        EnumSet<IncidentLevel> incidentLvl = EnumSet.allOf(IncidentLevel.class);


        for (int i = 0; i < 30; i++) {
            incidentDAO.addIncident(secure().nextAlphabetic(6), secure().nextAlphabetic(6), secure().nextAlphabetic(6),
                    incidentCat.stream().toList().get(RandomUtils.secure().randomInt(0, incidentCat.size())),
                    incidentLvl.stream().toList().get(RandomUtils.secure().randomInt(0, incidentLvl.size())),
                    List.of());
            //userDAO.addUser(secure().nextAlphabetic(6), secure().nextAlphabetic(6), UserRole.USER);
        }
    }
}
