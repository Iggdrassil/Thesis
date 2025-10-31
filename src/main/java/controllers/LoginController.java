package controllers;

import database.models.User;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ui.Model;
import database.DAO.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

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

    @PostMapping("/login")
    public String loginUser(@RequestParam String username,
                            @RequestParam String password,
                            HttpSession session,
                            Model model) {

        Optional<User> userOpt = userDAO.getUserByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (user.getPassword().equals(password)) {
                // сохраняем данные пользователя в сессии
                session.setAttribute("username", user.getUsername());
                session.setAttribute("role", user.getRole());

                log.info("User {} logged in successfully", username);
                return "redirect:/main"; // перенаправляем в главное меню
            }
        }

        // неверный логин/пароль
        model.addAttribute("error", "Неверное имя пользователя или пароль");
        log.info("User {} failed to login", username);
        return "login";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate(); // удаляем все данные сессии
        return "redirect:/login";
    }
}
