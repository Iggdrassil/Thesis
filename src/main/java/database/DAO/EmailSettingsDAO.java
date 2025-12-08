package database.DAO;

import database.Database;
import database.models.EmailSettings;
import enums.IncidentCategory;
import enums.IncidentLevel;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import services.AuditService;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static enums.AuditEventType.*;

@Component
@Repository
public class EmailSettingsDAO {

    private final Database database;
    private final AuditService auditService;

    public EmailSettingsDAO(Database database, AuditService auditService) {
        this.database = database;
        this.auditService = auditService;
    }

    public EmailSettings load() {
        String sql = "SELECT * FROM email_settings WHERE id = 1";

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (!rs.next()) {
                return new EmailSettings(); // дефолтные настройки
            }

            EmailSettings s = new EmailSettings();
            s.setEnabled(rs.getBoolean("enabled"));
            s.setSmtpHost(rs.getString("smtp_host"));
            s.setSmtpPort(rs.getInt("smtp_port"));
            s.setSmtpUsername(rs.getString("smtp_username"));
            s.setSmtpPassword(rs.getString("smtp_password"));
            s.setRecipientEmail(rs.getString("recipient_email"));
            s.setNotifyAll(rs.getBoolean("notify_all"));

            s.setAllowedLevels(parseLevels(rs.getString("allowed_levels")));
            s.setAllowedCategories(parseCategories(rs.getString("allowed_categories")));

            return s;

        } catch (SQLException e) {
            throw new RuntimeException("Failed to load email settings", e);
        }
    }

    public void save(EmailSettings emailSettings) {
        String sql = """
                INSERT INTO email_settings (id, enabled, smtp_host, smtp_port, smtp_username, smtp_password, 
                                            recipient_email, notify_all, allowed_levels, allowed_categories)
                VALUES (1,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(id) DO UPDATE SET
                    enabled=excluded.enabled,
                    smtp_host=excluded.smtp_host,
                    smtp_port=excluded.smtp_port,
                    smtp_username=excluded.smtp_username,
                    smtp_password=excluded.smtp_password,
                    recipient_email=excluded.recipient_email,
                    notify_all=excluded.notify_all,
                    allowed_levels=excluded.allowed_levels,
                    allowed_categories=excluded.allowed_categories
                """;

        try (Connection conn = database.createConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setBoolean(1, emailSettings.isEnabled());
            ps.setString(2, emailSettings.getSmtpHost());
            ps.setInt(3, emailSettings.getSmtpPort());
            ps.setString(4, emailSettings.getSmtpUsername());
            ps.setString(5, emailSettings.getSmtpPassword());
            ps.setString(6, emailSettings.getRecipientEmail());
            ps.setBoolean(7, emailSettings.isNotifyAll());
            ps.setString(8, joinLevels(emailSettings.getAllowedLevels()));
            ps.setString(9, joinCategories(emailSettings.getAllowedCategories()));

            ps.executeUpdate();

            auditService.logEventSimple(emailSettings.isEnabled() ? EMAIL_NOTIFICATION_ENABLE : EMAIL_NOTIFICATION_DISABLE,
                    SecurityContextHolder.getContext().getAuthentication().getName());
        } catch (SQLException e) {
            throw new RuntimeException("Failed to save email settings", e);
        }
    }

    private List<IncidentLevel> parseLevels(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .map(IncidentLevel::valueOf)
                .toList();
    }

    private List<IncidentCategory> parseCategories(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .map(IncidentCategory::valueOf)
                .toList();
    }

    private String joinLevels(List<IncidentLevel> list) {
        if (list == null) return "";
        return list.stream().map(Enum::name).collect(Collectors.joining(","));
    }

    private String joinCategories(List<IncidentCategory> list) {
        if (list == null) return "";
        return list.stream().map(Enum::name).collect(Collectors.joining(","));
    }
}

