package services;

import enums.AuditEventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final Map<String, Integer> attempts = new ConcurrentHashMap<>();
    private final Map<String, Long> blockedUntil = new ConcurrentHashMap<>();

    private final AuditService auditService;

    @Autowired
    public LoginAttemptService(AuditService auditService) {
        this.auditService = auditService;
    }

    private static final int MAX_ATTEMPTS = 3;
    private static final long BLOCK_TIME_MS = 60_000; // 1 минута

    public boolean isBlocked(String username) {
        Long until = blockedUntil.get(username);
        if (until == null) return false;

        if (System.currentTimeMillis() > until) {
            // Снять блокировку
            blockedUntil.remove(username);
            attempts.remove(username);

            auditService.logEvent(
                    AuditEventType.USER_LOGIN_UNBLOCK,
                    "System",
                    username
            );

            return false;
        }

        return true;
    }

    public void loginFailed(String username) {
        int newAttempts = attempts.getOrDefault(username, 0) + 1;
        attempts.put(username, newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
            blockedUntil.put(username, System.currentTimeMillis() + BLOCK_TIME_MS);

            auditService.logEvent(
                    AuditEventType.USER_LOGIN_BLOCK,
                    "System",
                    username
            );
        }
    }

    public void loginSucceeded(String username) {
        attempts.remove(username);
        blockedUntil.remove(username);
    }

    public long getRemainingSeconds(String username) {
        Long until = blockedUntil.get(username);
        if (until == null) return 0;

        long diff = until - System.currentTimeMillis();
        return Math.max(diff / 1000, 0);
    }

}

