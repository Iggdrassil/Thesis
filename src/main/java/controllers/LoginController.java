package controllers;

import database.DAO.UserDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

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
}
