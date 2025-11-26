package security;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import other.LoginSuccessHandler;

@Configuration
public class SecurityConfig {

    @Autowired
    private LoginSuccessHandler loginSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // что разрешаем всем (статические ресурсы, страницы логина)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/css_styles/**", "/js_scrypts/**", "/web/static/**", "/favicon.ico").permitAll()
                        .requestMatchers("/login", "/error").permitAll()
                        // API для пользователей — доступ только авторизованным
                        .requestMatchers("/users/api/**").hasRole("ADMIN") // пример: доступ только ADMIN
                        // страницы настроек — только для аутентифицированных
                        .requestMatchers("/settings", "/users", "/main", "/incidents", "/audit", "/stats").authenticated()
                        .anyRequest().authenticated()
                )

                // кастомная форма логина
                .formLogin(form -> form
                        .loginPage("/login")           // GET /login
                        .loginProcessingUrl("/userLogin") // POST сюда будет отправляться форма
                        .successHandler(loginSuccessHandler)
                        .defaultSuccessUrl("/main", true) // куда редирект после успешной аутентификации
                        .failureUrl("/login?error=true")
                        .permitAll()
                )

                // logout
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/logout", "POST"))
                        .logoutSuccessUrl("/login?logout=true")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )

        // CSRF включён по умолчанию — оставляем
        ;

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
