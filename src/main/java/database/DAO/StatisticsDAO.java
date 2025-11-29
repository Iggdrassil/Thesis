package database.DAO;

import database.DTO.StatisticsDto;
import database.Database;
import enums.IncidentCategory;
import enums.IncidentLevel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class StatisticsDAO {
    private static final Logger log = LoggerFactory.getLogger(StatisticsDAO.class);
    private final Database database;

    public StatisticsDAO(Database database) {
        this.database = database;
    }

    /**
     * Статистика по уровням важности
     */
    public List<StatisticsDto.ImportanceDto> getImportanceStats() {
        String sql = """
                SELECT incident_level, COUNT(*) AS cnt
                FROM incidents
                GROUP BY incident_level
                """;

        List<StatisticsDto.ImportanceDto> list = new ArrayList<>();

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                String levelStr = rs.getString("incident_level");
                IncidentLevel level = IncidentLevel.valueOf(levelStr);

                list.add(new StatisticsDto.ImportanceDto(
                        levelStr,
                        level.getLabel(),
                        rs.getLong("cnt")
                ));
            }

        } catch (SQLException e) {
            log.error("Error loading importance stats: {}", e.getMessage(), e);
        }

        return list;
    }

    /**
     * Статистика по категориям
     */
    public List<StatisticsDto.CategoryDto> getCategoryStats() {
        String sql = """
                SELECT incident_category, COUNT(*) AS cnt
                FROM incidents
                GROUP BY incident_category
                """;

        List<StatisticsDto.CategoryDto> list = new ArrayList<>();

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                String catStr = rs.getString("incident_category");
                IncidentCategory category = IncidentCategory.valueOf(catStr);


                list.add(new StatisticsDto.CategoryDto(
                        catStr,
                        category.getLabel(),
                        rs.getLong("cnt")
                ));
            }

        } catch (SQLException e) {
            log.error("Error loading category stats: {}", e.getMessage(), e);
        }

        return list;
    }

    /**
     * Статистика по дням (последние N дней)
     */
    public List<StatisticsDto.DailyDto> getDailyStats(int days) {

        LocalDate cutoff = LocalDate.now().minusDays(days);
        String cutoffStr = cutoff.toString(); // yyyy-MM-dd

        String sql = """
                SELECT DATE(creation_date) AS day, COUNT(*) AS cnt
                FROM incidents
                WHERE creation_date >= ?
                GROUP BY DATE(creation_date)
                ORDER BY day;
                """;

        List<StatisticsDto.DailyDto> list = new ArrayList<>();

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, cutoff.toString()); // yyyy-MM-dd

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {

                    LocalDate day = LocalDate.parse(rs.getString("day"));

                    list.add(new StatisticsDto.DailyDto(
                            day.toString(),      // "2025-11-19"
                            rs.getLong("cnt")
                    ));
                }
            }

        } catch (SQLException e) {
            log.error("Error loading daily stats: {}", e.getMessage(), e);
        }

        return list;
    }
}
