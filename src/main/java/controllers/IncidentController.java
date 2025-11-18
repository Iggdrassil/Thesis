package controllers;

import database.DAO.IncidentDAO;
import database.DTO.IncidentRequestDTO;
import database.DTO.IncidentResponseDTO;
import database.models.Incident;
import enums.IncidentCategory;
import enums.IncidentLevel;
import enums.IncidentRecommendation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/incidents")
public class IncidentController {

    private static final Logger log = LoggerFactory.getLogger(IncidentController.class);
    private static final int pageSize = 5;
    private final IncidentDAO incidentDAO;

    @Autowired
    public IncidentController(IncidentDAO incidentDAO) {
        this.incidentDAO = incidentDAO;
    }

    // Отображение страницы инцидентов
    @GetMapping
    public String incidentsPage(@RequestParam(defaultValue = "1") int page,
                                Model model,
                                Principal principal) {

        // Получаем все инциденты
        List<Incident> allIncidents = incidentDAO.getAllIncidents();
        int totalPages = (int) Math.ceil((double) allIncidents.size() / pageSize);

        // Вычисляем подсписок для текущей страницы
        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, allIncidents.size());
        List<Incident> incidentsOnPage = allIncidents.subList(start, end);

        // Добавляем данные в модель
        model.addAttribute("currentUser", principal.getName());
        model.addAttribute("incidents", incidentsOnPage);
        model.addAttribute("page", page);
        model.addAttribute("totalPages", totalPages);

        // Возвращаем страницу
        return "incidents"; // incidents.html в templates/
    }

    /**
     * Получить список всех инцидентов
     */
    @GetMapping("/list")
    public ResponseEntity<List<IncidentResponseDTO>> getAllIncidents(
            @RequestParam(value = "page", required = false) Integer page) {

        List<Incident> allIncidents = incidentDAO.getAllIncidents();

        // Если передан параметр page — делаем простую пагинацию
        if (page != null && page > 0) {
            int fromIndex = (page - 1) * pageSize;
            if (fromIndex >= allIncidents.size()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            int toIndex = Math.min(fromIndex + pageSize, allIncidents.size());
            allIncidents = allIncidents.subList(fromIndex, toIndex);
        }

        List<IncidentResponseDTO> response = allIncidents.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Добавить новый инцидент
     */
    @PostMapping("/add")
    public ResponseEntity<?> addIncident(@RequestBody IncidentRequestDTO dto) {
        log.info("Adding incident: {}", dto.getTitle());

        if (incidentDAO.isIncidentExists(dto.getTitle())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Инцидент с таким названием уже существует");
        }

        Optional<Incident> added = incidentDAO.addIncident(
                dto.getTitle(),
                dto.getDescription(),
                dto.getAuthor(),
                dto.getCategory(),
                dto.getLevel(),
                dto.getRecommendations()
        );

        return added
                .map(incident -> ResponseEntity.status(HttpStatus.CREATED).body(toDto(incident)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    /**
     * Удалить инцидент по ID
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteIncident(@PathVariable("id") UUID id) {
        log.info("Deleting incident: {}", id);

        Optional<Incident> deleted = incidentDAO.deleteIncident(id);
        if (deleted.isPresent()) {
            return ResponseEntity.ok(toDto(deleted.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Инцидент не найден");
        }
    }

    /**
     * Изменить инцидент (частичное обновление)
     */
    @PatchMapping("/edit/{id}")
    public ResponseEntity<?> editIncident(@PathVariable("id") UUID id,
                                          @RequestBody IncidentRequestDTO dto) {
        log.info("Editing incident: {}", id);

        Optional<Incident> existing = incidentDAO.findIncident(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Инцидент не найден");
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

        return updated
                .map(incident -> ResponseEntity.ok(toDto(incident)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/categories")
    @ResponseBody
    public List<EnumLocalizedDto> getCategories() {
        return Arrays.stream(IncidentCategory.values())
                .map(c -> new EnumLocalizedDto(c.name(), c.getLabel()))
                .toList();
    }

    @GetMapping("/levels")
    @ResponseBody
    public List<EnumLocalizedDto> getLevels() {
        return Arrays.stream(IncidentLevel.values())
                .map(l -> new EnumLocalizedDto(l.name(), l.getLabel()))
                .toList();
    }

    @GetMapping("/recommendations")
    @ResponseBody
    public List<EnumLocalizedDto> getRecommendations() {
        return Arrays.stream(IncidentRecommendation.values())
                .map(r -> new EnumLocalizedDto(r.name(), r.getLabel()))
                .toList();
    }

    /**
     * Получить один инцидент по ID
     */
    @GetMapping("/{id}")
    @ResponseBody
    public ResponseEntity<?> getIncidentById(@PathVariable("id") UUID id) {
        Optional<Incident> incident = incidentDAO.findIncident(id);

        if (incident.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Инцидент не найден");
        }

        return ResponseEntity.ok(toDto(incident.get()));
    }



    public record EnumLocalizedDto(String value, String label) {}


    /**
     * Конвертация в DTO
     */
    private IncidentResponseDTO toDto(Incident incident) {
        return new IncidentResponseDTO(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getAuthor(),
                incident.getCreationDate(),
                incident.getUpdatedDate(),
                incident.getIncidentCategory(),
                incident.getIncidentLevel(),
                incident.getIncidentRecommendations()
        );
    }
}
