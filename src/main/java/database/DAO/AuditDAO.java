package database.DAO;

import database.DTO.AuditRecordDto;
import database.Database;
import enums.AuditEventType;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class AuditDAO {

    private final Database database;

    public AuditDAO(Database database) {
        this.database = database;
    }

    public void addRecord(AuditRecordDto dto) {
        log.info("addRecord {}", dto.toString());

        String sql = """
                INSERT INTO audit_log (id, event_type, title, description, username, creation_datetime)
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, dto.id);
            ps.setString(2, dto.eventType);
            ps.setString(3, dto.title);
            ps.setString(4, dto.description);
            ps.setString(5, dto.username);
            ps.setString(6, dto.creationDatetime);

            ps.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Error inserting audit record", e);
        }
    }

    public List<AuditRecordDto> getPaged(int offset, int limit) {
        String sql = """
                SELECT * FROM audit_log
                ORDER BY creation_datetime DESC
                LIMIT ? OFFSET ?
                """;

        List<AuditRecordDto> list = new ArrayList<>();

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, limit);
            ps.setInt(2, offset);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    AuditRecordDto dto = new AuditRecordDto();

                    dto.id = rs.getString("id");
                    dto.eventType = rs.getString("event_type");
                    dto.title = rs.getString("title");
                    dto.description = rs.getString("description");
                    dto.username = rs.getString("username");
                    dto.creationDatetime = rs.getString("creation_datetime");

                    list.add(dto);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return list;
    }

    public int count() {
        String sql = "SELECT COUNT(*) FROM audit_log";

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            return rs.next() ? rs.getInt(1) : 0;

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public int countFiltered(List<AuditEventType> eventTypes, String username) {
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) FROM audit_log WHERE 1=1"
        );

        if (eventTypes != null && !eventTypes.isEmpty()) {
            sql.append(" AND event_type IN (");
            sql.append(String.join(",", eventTypes.stream().map(e -> "?").toList()));
            sql.append(")");
        }

        if (username != null && !username.isBlank()) {
            sql.append(" AND LOWER(username) LIKE ?");
        }

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            int idx = 1;


            if (eventTypes != null && !eventTypes.isEmpty()) {
                for (AuditEventType eventType : eventTypes) {
                    ps.setString(idx + 1, eventType.toString());
                }
            }

            if (username != null && !username.isBlank()) {
                ps.setString(idx, "%" + username.toLowerCase() + "%");
            }

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error counting filtered audit records", e);
        }
    }

    public List<AuditRecordDto> getPagedFiltered(
            List<AuditEventType> eventTypes,
            String username,
            int offset,
            int limit
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT *
            FROM audit_log
            WHERE 1=1
            """);

        if (eventTypes != null && !eventTypes.isEmpty()) {
            sql.append(" AND event_type IN (");
            sql.append(String.join(",", eventTypes.stream().map(e -> "?").toList()));
            sql.append(")");
        }

        if (username != null && !username.isBlank()) {
            sql.append(" AND LOWER(username) LIKE ?");
        }

        sql.append(" ORDER BY creation_datetime DESC LIMIT ? OFFSET ?");

        List<AuditRecordDto> list = new ArrayList<>();

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            int index = 1;

            if (eventTypes != null && !eventTypes.isEmpty()) {
                for (AuditEventType type : eventTypes) {
                    ps.setString(index++, type.toString());
                }
            }

            if (username != null && !username.isBlank()) {
                ps.setString(index++, "%" + username.toLowerCase() + "%");
            }

            ps.setInt(index++, limit);
            ps.setInt(index, offset);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    AuditRecordDto dto = new AuditRecordDto();

                    dto.id = rs.getString("id");
                    dto.eventType = rs.getString("event_type");
                    dto.title = rs.getString("title");
                    dto.description = rs.getString("description");
                    dto.username = rs.getString("username");
                    dto.creationDatetime = rs.getString("creation_datetime");

                    list.add(dto);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error fetching filtered audit records", e);
        }

        return list;
    }

}
