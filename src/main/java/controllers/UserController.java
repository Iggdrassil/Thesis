package controllers;

import database.DAO.UserDAO;
import database.DTO.EditUserDTO;
import database.DTO.ErrorResponseDTO;
import database.DTO.UserDTO;
import database.models.User;
import enums.UserError;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Controller
@RequestMapping("/users")
public class UserController {

    private static final int PAGE_SIZE = 5;

    private final UserDAO userDAO;
    private final AuditService auditService;

    @Autowired
    public UserController(UserDAO userDAO, AuditService auditService) {
        this.auditService = auditService;
        this.userDAO = userDAO;
    }

    // ---------------- PAGE VIEW ----------------

    @GetMapping
    public String usersPage(@RequestParam(defaultValue = "1") int page,
                            Model model,
                            Principal principal) {

        List<User> allUsers = userDAO.getAllUsers();
        int totalPages = Math.max(1, (int) Math.ceil((double) allUsers.size() / PAGE_SIZE));

        int start = Math.max(0, (page - 1) * PAGE_SIZE);
        int end = Math.min(start + PAGE_SIZE, allUsers.size());
        List<User> users = allUsers.subList(start, end);

        model.addAttribute("currentUser", principal.getName());
        model.addAttribute("users", users);
        model.addAttribute("page", page);
        model.addAttribute("totalPages", totalPages);

        return "userManagement";
    }

    // ---------------- REST API ----------------

    @ResponseBody
    @GetMapping("/list")
    public Map<String, Object> getUsers(@RequestParam(defaultValue = "1") int page) {

        List<User> allUsers = userDAO.getAllUsers();
        int totalPages = Math.max(1, (int) Math.ceil((double) allUsers.size() / PAGE_SIZE));

        int start = Math.max(0, (page - 1) * PAGE_SIZE);
        int end = Math.min(start + PAGE_SIZE, allUsers.size());
        List<User> paged = allUsers.subList(start, end);

        return Map.of(
                "users", paged,
                "page", page,
                "totalPages", totalPages
        );
    }

    @ResponseBody
    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody UserDTO dto) {
        String actionUser = getCurrentUser();
        log.info("Attempt to create user {}", dto.getUsername());

        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            return error(UserError.INVALID_INPUT);
        }

        if (userDAO.isUserExists(dto.getUsername())) {
            return error(UserError.USER_ALREADY_EXISTS);
        }

        Optional<?> created = userDAO.addUser(dto.getUsername(), dto.getPassword(), dto.getRole());

        if (created.isEmpty()) {
            return error(UserError.USER_CREATE_FAILED);
        }

        auditService.logEvent(USER_CREATED, actionUser, actionUser,
                dto.getUsername(), dto.getRole().getRoleName());

        return ResponseEntity.ok().build();
    }

    @ResponseBody
    @DeleteMapping("/delete/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username, Principal principal) {

        String actionUser = getCurrentUser();
        log.info("Attempt to delete user {}", username);

        // нельзя удалить себя
        if (principal.getName().equals(username)) {
            return error(UserError.CANNOT_DELETE_SELF);
        }

        Optional<User> deleted = userDAO.deleteUser(username);

        if (deleted.isEmpty()) {
            return error(UserError.USER_NOT_FOUND);
        }

        auditService.logEvent(
                USER_DELETED,
                actionUser,
                actionUser,
                deleted.get().getUsername(),
                deleted.get().getRole().getRoleName()
        );

        return ResponseEntity.ok().build();
    }

    @ResponseBody
    @PutMapping("/edit")
    public ResponseEntity<?> editUser(@RequestBody EditUserDTO dto, Principal principal) {

        String actionUser = principal.getName();
        log.info("Editing user {}", dto.getOldUsername());

        // запрет менять себя на другое имя
        if (dto.getOldUsername().equals(actionUser)
                && !dto.getOldUsername().equals(dto.getNewUsername())) {
            return error(UserError.CANNOT_RENAME_SELF);
        }

        // запрет переименования в уже существующее имя
        if (!dto.getOldUsername().equals(dto.getNewUsername())
                && userDAO.isUserExists(dto.getNewUsername())) {
            return error(UserError.USER_ALREADY_EXISTS);
        }

        Optional<User> edited = userDAO.editUser(
                dto.getOldUsername(),
                dto.getNewPassword(),
                dto.getNewRole(),
                dto.getNewUsername()
        );

        if (edited.isEmpty()) {
            return error(UserError.USER_EDIT_FAILED);
        }

        auditService.logEvent(
                USER_EDITED,
                actionUser,
                dto.getOldUsername(),
                actionUser
        );

        return ResponseEntity.ok().build();
    }

    @ResponseBody
    @GetMapping("/get/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        Optional<User> user = userDAO.getUserByUsername(username);

        if (user.isEmpty()) {
            return error(UserError.USER_NOT_FOUND);
        }

        return ResponseEntity.ok(user.get());
    }

    // ---------------- HELPERS ----------------

    private String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private ResponseEntity<ErrorResponseDTO> error(UserError e) {
        return ResponseEntity
                .status(e.getStatus())
                .body(new ErrorResponseDTO(e.name(), e.getMessage()));
    }
}
