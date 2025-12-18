package controllers;

import database.DAO.UserDAO;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    private final UserDAO userDAO;

    @Autowired
    public LoginController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @GetMapping("/login")
    @Operation(summary = "Открыть страницу логина")
    public String loginPage() {
        return "login"; // имя шаблона login.html
    }
}
