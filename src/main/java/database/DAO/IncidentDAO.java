package database.DAO;

import database.Database;
import database.models.Incident;
import enums.IncidentCategory;
import enums.IncidentLevel;
import enums.IncidentRecommendation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class IncidentDAO {
    private static final Logger log = LoggerFactory.getLogger(IncidentDAO.class);
    private final Database database;

    public IncidentDAO(Database database) {
        this.database = database;
    }

    /**
     * Добавление нового инцидента
     */
    public Optional<Incident> addIncident(String title,
                                          String description,
                                          String author,
                                          IncidentCategory category,
                                          IncidentLevel level,
                                          List<IncidentRecommendation> recommendations) {
        String sql = "INSERT INTO incidents (id, title, description, author, creation_date, updated_date, " +
                "incident_category, incident_level, incident_recommendations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        UUID id = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, id.toString());
            stmt.setString(2, title);
            stmt.setString(3, description);
            stmt.setString(4, author);
            stmt.setString(5, now.toString());
            stmt.setString(6, now.toString());
            stmt.setString(7, category.name());
            stmt.setString(8, level.name());

            // Сохраняем рекомендации как CSV
            String recommendationsCsv = recommendations.stream()
                    .map(Enum::name)
                    .collect(Collectors.joining(","));
            stmt.setString(9, recommendationsCsv);

            stmt.executeUpdate();

            log.info("Added incident: {}", title);
            return Optional.of(new Incident(id, title, description, author, now, now, category, level, recommendations));

        } catch (SQLException e) {
            log.error("Error adding incident: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * Редактирование инцидента (по сути — обновление записи)
     */
    public Optional<Incident> editIncident(UUID incidentId, String title, String description,
                                           IncidentCategory category, IncidentLevel level,
                                           List<IncidentRecommendation> recommendations) {
        String sql = "UPDATE incidents SET title = ?, description = ?, updated_date = ?, " +
                "incident_category = ?, incident_level = ?, incident_recommendations = ? WHERE id = ?";

        LocalDateTime updatedDate = LocalDateTime.now();

        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, title);
            stmt.setString(2, description);
            stmt.setString(3, updatedDate.toString());
            stmt.setString(4, category.name());
            stmt.setString(5, level.name());
            stmt.setString(6, recommendations.stream().map(Enum::name).collect(Collectors.joining(",")));
            stmt.setString(7, incidentId.toString());

            int affected = stmt.executeUpdate();
            if (affected > 0) {
                return findIncident(incidentId);
            } else {
                log.warn("No incident found with ID {}", incidentId);
                return Optional.empty();
            }

        } catch (SQLException e) {
            log.error("Error editing incident: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * Удаление инцидента
     */
    public Optional<Incident> deleteIncident(UUID incidentId) {
        Optional<Incident> existing = findIncident(incidentId);
        if (existing.isEmpty()) return Optional.empty();

        String sql = "DELETE FROM incidents WHERE id = ?";

        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, incidentId.toString());
            stmt.executeUpdate();
            log.info("Deleted incident {}", incidentId);
            return existing;

        } catch (SQLException e) {
            log.error("Error deleting incident: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * Поиск инцидента по ID
     */
    public Optional<Incident> findIncident(UUID incidentId) {
        String sql = "SELECT * FROM incidents WHERE id = ?";

        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, incidentId.toString());
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapRowToIncident(rs));
            }

        } catch (SQLException e) {
            log.error("Error finding incident: {}", e.getMessage(), e);
        }
        return Optional.empty();
    }

    /**
     * Проверка существования инцидента по названию
     */
    public boolean isIncidentExists(String title) {
        String sql = "SELECT COUNT(*) FROM incidents WHERE title = ?";

        try (Connection conn = database.createConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, title);
            ResultSet rs = stmt.executeQuery();
            return rs.next() && rs.getInt(1) > 0;

        } catch (SQLException e) {
            log.error("Error checking incident existence: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Получить все инциденты
     */
    public List<Incident> getAllIncidents() {
        String sql = "SELECT * FROM incidents ORDER BY creation_date DESC";
        List<Incident> incidents = new ArrayList<>();

        try (Connection conn = database.createConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                incidents.add(mapRowToIncident(rs));
            }

        } catch (SQLException e) {
            log.error("Error fetching all incidents: {}", e.getMessage(), e);
        }
        return incidents;
    }

    /**
     * Преобразование строки из БД в объект Incident
     */
    private Incident mapRowToIncident(ResultSet rs) throws SQLException {
        UUID id = UUID.fromString(rs.getString("id"));
        String title = rs.getString("title");
        String description = rs.getString("description");
        String author = rs.getString("author");
        LocalDateTime creationDate = LocalDateTime.parse(rs.getString("creation_date"));
        LocalDateTime updatedDate = LocalDateTime.parse(rs.getString("updated_date"));
        IncidentCategory category = IncidentCategory.valueOf(rs.getString("incident_category"));
        IncidentLevel level = IncidentLevel.valueOf(rs.getString("incident_level"));

        String recsStr = rs.getString("incident_recommendations");
        List<IncidentRecommendation> recommendations = new ArrayList<>();
        if (recsStr != null && !recsStr.isEmpty()) {
            recommendations = Arrays.stream(recsStr.split(","))
                    .map(String::trim)
                    .map(IncidentRecommendation::valueOf)
                    .collect(Collectors.toList());
        }

        return new Incident(id, title, description, author, creationDate, updatedDate, category, level, recommendations);
    }
}
