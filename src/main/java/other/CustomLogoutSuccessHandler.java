package other;

import enums.AuditEventType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;
import services.AuditService;

import java.io.IOException;

@Component
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

    private final AuditService auditService;

    @Autowired
    public CustomLogoutSuccessHandler(AuditService auditService) {
        this.auditService = auditService;
    }

    @Override
    public void onLogoutSuccess(HttpServletRequest request,
                                HttpServletResponse response,
                                Authentication authentication) throws IOException {

        if (authentication != null) {
            String username = authentication.getName();

            auditService.logEvent(
                    AuditEventType.USER_LOGOUT,
                    username,
                    username
            );
        }

        response.sendRedirect("/login?logout=true");
    }
}
