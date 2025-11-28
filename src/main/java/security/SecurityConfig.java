package security;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import other.CustomLogoutSuccessHandler;
import other.LoginSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final LoginSuccessHandler loginSuccessHandler;

    @Autowired
    public SecurityConfig(LoginSuccessHandler loginSuccessHandler) {
        this.loginSuccessHandler = loginSuccessHandler;
    }

    @Autowired
    private CustomLogoutSuccessHandler logoutSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // --- ОГРАНИЧЕНИЯ ДОСТУПА ---
                .authorizeHttpRequests(auth -> auth
                        // Статика (обязательно разрешать!)
                        .requestMatchers(
                                "/css_styles/**",
                                "/js_scrypts/**",
                                "/web/static/**",
                                "/favicon.ico"
                        ).permitAll()
                        .requestMatchers("/login", "/error").permitAll() // Страница логина и ошибка — доступны всем
                        .requestMatchers("/users/api/**").hasRole("ADMIN") // только админам
                        // Основные страницы — только авторизованным
                        .requestMatchers("/settings", "/users", "/main",
                                "/incidents", "/audit", "/statistics")
                        .authenticated()
                        .anyRequest().authenticated()
                )

                // --- НАСТРОЙКИ ФОРМЫ ЛОГИНА ---
                .formLogin(form -> form
                        .loginPage("/login")                // GET — форма логина
                        .loginProcessingUrl("/userLogin")   // POST — обработка логина
                        .successHandler(loginSuccessHandler)
                        .failureUrl("/login?error=true")
                        .permitAll()
                )


                // --- ВЫХОД ИЗ СИСТЕМЫ ---
                .logout(logout -> logout
                        .logoutRequestMatcher(
                                new AntPathRequestMatcher("/logout", "POST"))
                        .logoutSuccessHandler(logoutSuccessHandler)
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )

        // CSRF включён по умолчанию
        ;

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

