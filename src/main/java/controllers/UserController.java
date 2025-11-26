package controllers;

import database.DAO.UserDAO;
import database.DTO.UserDTO;
import database.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;

import java.security.Principal;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import services.AuditService;

import static enums.AuditEventType.*;

@Controller
@RequestMapping("/users")
public class UserController {

    private static final int pageSize = 5;
    private final UserDAO userDAO;
    private final AuditService auditService;
    private String actionUser;

    @Autowired
    public UserController(UserDAO userDAO, AuditService auditService) {
        this.auditService = auditService;
        this.userDAO = userDAO;
    }

    // Отображение страницы
    @GetMapping
    public String usersPage(@RequestParam(defaultValue = "1") int page, Model model, Principal principal) {
        List<User> allUsers = userDAO.getAllUsers();
        int totalPages = (int) Math.ceil((double) allUsers.size() / pageSize);

        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, allUsers.size());
        List<User> usersOnPage = allUsers.subList(start, end);

        model.addAttribute("currentUser", principal.getName());
        model.addAttribute("users", usersOnPage);
        model.addAttribute("page", page);
        model.addAttribute("totalPages", totalPages);

        return "userManagement"; // userManagement.html в templates/
    }

    // REST-запрос на получение пользователей
    @GetMapping("/list")
    @ResponseBody
    public Map<String, Object> getUsers(@RequestParam(defaultValue = "1") int page) {
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
        actionUser = SecurityContextHolder.getContext().getAuthentication().getName();

        if (userDAO.isUserExists(userDto.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        userDAO.addUser(userDto.getUsername(), userDto.getPassword(), userDto.getRole());
        auditService.logEvent(USER_CREATED, actionUser, actionUser, userDto.getUsername(), userDto.getRole().getRoleName());

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{username}")
    @ResponseBody
    public ResponseEntity<?> deleteUser(@PathVariable String username, Principal principal) {
        actionUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // нельзя удалить себя
        String current = principal.getName();
        if (current.equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Нельзя удалить самого себя"));
        }

        Optional<User> deleted = userDAO.deleteUser(username);
        if (deleted.isPresent()) {
            auditService.logEvent(USER_DELETED, actionUser, actionUser, deleted.get().getUsername(), deleted.get().getRole().getRoleName());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Пользователь не найден"));
        }
    }

}
