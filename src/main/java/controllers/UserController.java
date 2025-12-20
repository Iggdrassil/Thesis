package controllers;

import database.DAO.UserDAO;
import database.DTO.EditUserDTO;
import database.DTO.ErrorResponseDTO;
import database.DTO.PageResultDTO;
import database.DTO.UserDTO;
import database.models.User;
import enums.UserError;
import enums.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;

import java.security.Principal;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import other.PaginationUtils;
import services.AuditService;

import static enums.AuditEventType.*;

@Slf4j
@Controller
@RequestMapping("/users")
@Tag(name = "Users", description = "API для работы с пользователями")
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
    @Operation(summary = "Открыть страницу пользователей")
    public String usersPage(@RequestParam(defaultValue = "1") int page, Model model) {

        PageResultDTO<User> result = PaginationUtils.paginateList(userDAO.getAllUsers(), page, PAGE_SIZE);

        model.addAttribute("users", result.getContent());
        model.addAttribute("page", result.getPage());
        model.addAttribute("totalPages", result.getTotalPages());

        return "userManagement";
    }

    // ---------------- REST API ----------------

    @ResponseBody
    @GetMapping("/list")
    @Operation(summary = "Получить список пользователей")
    public Map<String, Object> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) List<UserRole> roles
    ) {

        List<User> users = userDAO.getAllUsers();

        if (roles != null && !roles.isEmpty()) {
            users = users.stream()
                    .filter(u -> roles.contains(u.getRole()))
                    .toList();
        }

        PageResultDTO<User> result =
                PaginationUtils.paginateList(users, page, PAGE_SIZE);

        return Map.of(
                "users", result.getContent(),
                "page", result.getPage(),
                "totalPages", result.getTotalPages()
        );
    }


    @ResponseBody
    @PostMapping("/add")
    @Operation(summary = "Добавить нового пользователя")
    public ResponseEntity<?> addUser(@RequestBody UserDTO dto) {
        String actionUser = getCurrentUser();
        log.info("Attempt to create user {}", dto.getUsername());

        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            return error(UserError.INVALID_INPUT);
        }

        if (userDAO.isUserExists(dto.getUsername())) {
            return error(UserError.USER_ALREADY_EXISTS);
        }

        if (!isPasswordValid(dto.getPassword())) {
            return error(UserError.WRONG_PASSWORD);
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
    @Operation(summary = "Удалить пользователя")
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
    @Operation(summary = "Редактировать пользователя")
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

        // проверяем новый пароль только если он не пустой
        if (dto.getNewPassword() != null && !dto.getNewPassword().isBlank()) {
            if (!isPasswordValid(dto.getNewPassword())) {
                return error(UserError.WRONG_PASSWORD);
            }
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
    @Operation(summary = "Получить пользователя по имени")
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

    private boolean isPasswordValid(String password) {
        if (password == null || password.length() < 3) return false;
        if (!password.matches(".*[a-z].*")) return false;          // строчные буквы
        if (!password.matches(".*[A-Z].*")) return false;          // прописные буквы
        if (!password.matches(".*\\d.*")) return false;            // цифры
        return password.matches(".*[!@#$%^&*()].*");   // спецсимволы
    }

}
