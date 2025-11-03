package controllers;

import database.DAO.UserDAO;
import database.DTO.UserDTO;
import database.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;

import java.security.Principal;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;

@Controller
@RequestMapping("/users")
public class UserController {

    private final UserDAO userDAO;

    @Autowired
    public UserController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @GetMapping("/users")
    public String usersPage(Model model, Principal principal) {
        model.addAttribute("currentUser", principal.getName());
        return "user-management";
    }

    // Отображение страницы
    @GetMapping
    public String usersPage(@RequestParam(defaultValue = "1") int page, Model model) {
        int pageSize = 10;
        List<User> allUsers = userDAO.getAllUsers();
        int totalPages = (int) Math.ceil((double) allUsers.size() / pageSize);

        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, allUsers.size());
        List<User> usersOnPage = allUsers.subList(start, end);

        model.addAttribute("users", usersOnPage);
        model.addAttribute("page", page);
        model.addAttribute("totalPages", totalPages);

        return "userManagement"; // userManagement.html в templates/
    }

    // REST-запрос на получение пользователей
    @GetMapping("/api")
    @ResponseBody
    public Map<String, Object> getUsers(@RequestParam(defaultValue = "1") int page) {
        int pageSize = 10;
        List<User> allUsers = userDAO.getAllUsers();
        int totalPages = (int) Math.ceil((double) allUsers.size() / pageSize);

        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, allUsers.size());
        List<User> usersOnPage = allUsers.subList(start, end);

        Map<String, Object> response = new HashMap<>();
        response.put("users", usersOnPage);
        response.put("totalPages", totalPages);
        response.put("page", page);
        return response;
    }

    @PostMapping("/add")
    @ResponseBody
    public ResponseEntity<?> addUser(@RequestBody UserDTO userDto) {
        if (userDAO.isUserExists(userDto.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        userDAO.addUser(userDto.getUsername(), userDto.getPassword(), userDto.getRole());
        return ResponseEntity.ok().build();
    }

}
