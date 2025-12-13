package other;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import services.LoginAttemptService;

import java.io.IOException;

@Component
public class LoginFailureHandler implements AuthenticationFailureHandler {

    private final LoginAttemptService attemptService;

    @Autowired
    public LoginFailureHandler(LoginAttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {

        String username = request.getParameter("username");

        // если аккаунт заблокирован
        if (exception instanceof LockedException) {
            long seconds = attemptService.getRemainingSeconds(username);

            response.setStatus(423); // Locked
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                    "{\"blocked\":true,\"seconds\":" + seconds + "}"
            );
            return;
        }

        // обычная ошибка входа
        attemptService.loginFailed(username);
        response.sendRedirect("/login?error=true");
    }
}

