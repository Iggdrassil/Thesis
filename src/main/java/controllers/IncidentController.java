package controllers;

import database.DAO.IncidentDAO;
import database.DTO.*;
import database.models.Incident;
import enums.IncidentCategory;
import enums.IncidentError;
import enums.IncidentLevel;
import enums.IncidentRecommendation;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import other.PaginationUtils;
import services.AuditService;
import services.IncidentAsyncService;

import java.util.*;
import java.util.stream.Collectors;

import static enums.AuditEventType.*;

@Slf4j
@Controller
@RequestMapping("/incidents")
@Tag(name = "Incidents", description = "API для работы с инцидентами")
public class IncidentController {

    private static final int PAGE_SIZE = 5;
    private final IncidentDAO incidentDAO;
    private final AuditService auditService;
    private final IncidentAsyncService incidentAsyncService;

    @Autowired
    public IncidentController(IncidentDAO incidentDAO,
                              AuditService auditService,
                              IncidentAsyncService incidentAsyncService) {
        this.incidentDAO = incidentDAO;
        this.auditService = auditService;
        this.incidentAsyncService = incidentAsyncService;
    }

    // ---------- PAGE VIEW ----------

    @GetMapping
    public String incidentsPage(@RequestParam(defaultValue = "1") int page, Model model,
                                @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {

        PageResultDTO<Incident> res = PaginationUtils.paginateList(incidentDAO.getAllIncidents(), page, PAGE_SIZE);

        String role = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)  // вернёт "ROLE_ADMIN", "ROLE_USER" и т.д.
                .findFirst()
                .orElse("USER");

        model.addAttribute("role", role);
        model.addAttribute("currentUser", principal.getUsername());
        model.addAttribute("incidents", res.getContent());
        model.addAttribute("page", res.getPage());
        model.addAttribute("totalPages", res.getTotalPages());

        return "incidents";
    }

    // ---------- API ----------

    @GetMapping("/list")
    @Operation(summary = "Получить список всех инцидентов")
    public ResponseEntity<?> getAllIncidents(
            @RequestParam(value = "page", required = false) Integer page) {

        List<Incident> all = incidentDAO.getAllIncidents();

        if (page != null && page > 0) {
            int from = (page - 1) * PAGE_SIZE;
            if (from >= all.size()) return ResponseEntity.ok(Collections.emptyList());
            int to = Math.min(from + PAGE_SIZE, all.size());
            all = all.subList(from, to);
        }

        return ResponseEntity.ok(all.stream().map(this::toDto).toList());
    }

    @PostMapping("/add")
    @Operation(summary = "Добавить новый инцидент")
    public ResponseEntity<?> addIncident(@RequestBody IncidentRequestDTO dto) {

        String user = getCurrentUser();

        // Проверка DTO
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            return error(IncidentError.INVALID_INPUT);
        }

        if (incidentDAO.isIncidentExists(dto.getTitle())) {

            auditService.logEvent(
                    INCIDENT_CREATE_ERROR,
                    user,
                    dto.getTitle(),
                    IncidentError.INCIDENT_ALREADY_EXISTS.getMessage()
            );

            return error(IncidentError.INCIDENT_ALREADY_EXISTS);
        }

        Optional<Incident> created = incidentDAO.addIncident(
                dto.getTitle(),
                dto.getDescription(),
                dto.getAuthor(),
                dto.getCategory(),
                dto.getLevel(),
                dto.getRecommendations()
        );

        if (created.isEmpty()) {
            return error(IncidentError.INCIDENT_CREATE_FAILED);
        }

        Incident incident = created.get();
        ResponseEntity<?> response = ResponseEntity.ok(toDto(incident));

        // асинхронная обработка
        incidentAsyncService.processAfterCreate(incident, user);

        return response;
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Удалить инцидент")
    public ResponseEntity<?> deleteIncident(@PathVariable UUID id) {
        log.info("Deleting incident {}", id);

        String user = getCurrentUser();

        Optional<Incident> deleted = incidentDAO.deleteIncident(id);

        if (deleted.isEmpty()) {
            return error(IncidentError.INCIDENT_NOT_FOUND);
        }

        auditService.logEvent(INCIDENT_DELETED, user, deleted.get().getTitle(), user);
        return ResponseEntity.ok(toDto(deleted.get()));
    }

    @PatchMapping("/edit/{id}")
    @Operation(summary = "Редактировать инцидент")
    public ResponseEntity<?> editIncident(@PathVariable UUID id,
                                          @RequestBody IncidentRequestDTO dto) {
        log.info("Editing incident {}", id);

        String user = getCurrentUser();

        Optional<Incident> existing = incidentDAO.findIncident(id);

        if (existing.isEmpty()) {
            return error(IncidentError.INCIDENT_NOT_FOUND);
        }

        Incident old = existing.get();

        Optional<Incident> updated = incidentDAO.editIncident(
                id,
                dto.getTitle() != null ? dto.getTitle() : old.getTitle(),
                dto.getDescription() != null ? dto.getDescription() : old.getDescription(),
                dto.getCategory() != null ? dto.getCategory() : old.getIncidentCategory(),
                dto.getLevel() != null ? dto.getLevel() : old.getIncidentLevel(),
                dto.getRecommendations() != null ? dto.getRecommendations() : old.getIncidentRecommendations()
        );

        if (updated.isEmpty()) {
            return error(IncidentError.INCIDENT_UPDATE_FAILED);
        }

        auditService.logEvent(INCIDENT_UPDATED, user, updated.get().getTitle(), user);
        return ResponseEntity.ok(toDto(updated.get()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить инцидент по ID")
    public ResponseEntity<?> getIncidentById(@PathVariable UUID id) {
        Optional<Incident> incident = incidentDAO.findIncident(id);

        if (incident.isEmpty()) {
            return error(IncidentError.INCIDENT_NOT_FOUND);
        }

        return ResponseEntity.ok(toDto(incident.get()));
    }

    // ---------- ENUM LOCALIZED DTO ----------


    @ResponseBody
    @GetMapping("/categories")
    @Operation(summary = "Получить категории инцидента")
    public List<EnumLocalizedDto> getCategories() {
        return Arrays.stream(IncidentCategory.values())
                .map(c -> new EnumLocalizedDto(c.name(), c.getLabel()))
                .toList();
    }

    @ResponseBody
    @GetMapping("/levels")
    @Operation(summary = "Получить уровни важности инцидента")
    public List<EnumLocalizedDto> getLevels() {
        return Arrays.stream(IncidentLevel.values())
                .map(l -> new EnumLocalizedDto(l.name(), l.getLabel()))
                .toList();
    }

    @ResponseBody
    @GetMapping("/recommendations")
    @Operation(summary = "Получить рекоммендации инцидента")
    public List<EnumLocalizedDto> getRecommendations() {
        return Arrays.stream(IncidentRecommendation.values())
                .map(r -> new EnumLocalizedDto(r.name(), r.getLabel()))
                .toList();
    }

    // ---------- HELPERS ----------

    private String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private ResponseEntity<ErrorResponseDTO> error(IncidentError error) {
        return ResponseEntity
                .status(error.getStatus())
                .body(new ErrorResponseDTO(error.name(), error.getMessage()));
    }

    private IncidentResponseDTO toDto(Incident incident) {
        List<String> recLabels = incident.getIncidentRecommendations().stream()
                .map(IncidentRecommendation::getLabel)
                .collect(Collectors.toList());

        return new IncidentResponseDTO(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getAuthor(),
                incident.getCreationDate(),
                incident.getUpdatedDate(),
                incident.getIncidentCategory(),
                incident.getIncidentLevel(),
                incident.getIncidentRecommendations(),
                incident.getIncidentCategory().getLabel(),
                incident.getIncidentLevel().getLabel(),
                recLabels
        );
    }
}
