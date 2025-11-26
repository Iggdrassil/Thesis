package other;

import enums.AuditEventType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import services.AuditService;

import java.io.IOException;

@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuditService auditService;

    public LoginSuccessHandler(AuditService auditService) {
        this.auditService = auditService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        System.out.println("=== LOGIN SUCCESS HANDLER CALLED ===");
        String username = authentication.getName();

        auditService.logEvent(
                AuditEventType.USER_LOGIN,
                username,
                username
        );

        response.sendRedirect("/main");
    }
}

