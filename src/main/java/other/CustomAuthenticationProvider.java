package other;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import security.CustomUserDetailsService;
import services.AuditService;
import services.LoginAttemptService;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService attemptService;
    private final AuditService auditService;

    @Autowired
    public CustomAuthenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder,
            LoginAttemptService attemptService,
            AuditService auditService
    ) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.attemptService = attemptService;
        this.auditService = auditService;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();

        if (attemptService.isBlocked(username)) {
            throw new LockedException("User temporarily blocked");
        }

        UserDetails user = userDetailsService.loadUserByUsername(username);

        String rawPassword = authentication.getCredentials().toString();

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            attemptService.loginFailed(username);
            throw new BadCredentialsException("Bad password");
        }

        attemptService.loginSucceeded(username);

        return new UsernamePasswordAuthenticationToken(
                user, user.getPassword(), user.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}

