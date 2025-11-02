package security;

import database.DAO.UserDAO;
import database.models.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserDAO userDAO;

    public CustomUserDetailsService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userDAO.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Конвертируем роль в GrantedAuthority: ROLE_ADMIN и т.д.
        String roleName = "ROLE_" + user.getRole().name(); // UserRole.ADMIN -> ROLE_ADMIN
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword()) // пароль уже должен быть в хэше
                .authorities(List.of(new SimpleGrantedAuthority(roleName)))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
