package controllers;

import database.DAO.UserDAO;
import database.models.User;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;

@Controller
public class LoginController {

    private static final Logger log = LoggerFactory.getLogger(LoginController.class);
    private final UserDAO userDAO;

    @Autowired
    public LoginController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login"; // имя шаблона login.html
    }

   /* @PostMapping("/userLogin")
    public String loginUser(@RequestParam String username,
                            @RequestParam String password,
                            HttpSession session,
                            Model model) {
        User user = userDAO.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (user == null || !user.getPassword().equals(password)) {
            model.addAttribute("error", "Неверный логин или пароль");
            return "login"; // возвращаем обратно на страницу логина
        }

        // Сохраняем данные пользователя в сессию
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole());

        // Логируем вход
        log.info("User '{}' вошёл в систему с ролью '{}'", user.getUsername(), user.getRole());

        // Перенаправляем на главную страницу
        return "redirect:/main";
    }*/


    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate(); // удаляем все данные сессии
        return "redirect:/login";
    }
}
