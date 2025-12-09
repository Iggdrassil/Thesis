package controllers;

import database.DAO.StatisticsDAO;
import database.DTO.StatisticsDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("/statistics")
public class StatisticsController {

    private final StatisticsDAO statisticsDAO;

    @Autowired
    public StatisticsController(StatisticsDAO statisticsDAO) {
        this.statisticsDAO = statisticsDAO;
    }

    /**
     * HTML-страница статистики
     */
    @GetMapping
    public String statisticsPage(
            @RequestParam(value = "days", required = false, defaultValue = "30") int days,
            Model model
    ) {
        List<StatisticsDto.ImportanceDto> importance = statisticsDAO.getImportanceStats();
        List<StatisticsDto.CategoryDto> categories = statisticsDAO.getCategoryStats();
        List<StatisticsDto.DailyDto> daily = statisticsDAO.getDailyStats(days);

        model.addAttribute("importanceStats", importance);
        model.addAttribute("categoryStats", categories);
        model.addAttribute("dailyStats", daily);
        model.addAttribute("selectedDays", days);

        return "statistics"; // Thymeleaf: templates/statistics.html
    }

    /**
     * API — статистика по уровням важности
     */
    @ResponseBody
    @GetMapping("/api/importance")
    public ResponseEntity<List<StatisticsDto.ImportanceDto>> getImportanceStats() {
        return ResponseEntity.ok(statisticsDAO.getImportanceStats());
    }

    /**
     * API — статистика по категориям
     */
    @ResponseBody
    @GetMapping("/api/categories")
    public ResponseEntity<List<StatisticsDto.CategoryDto>> getCategoryStats() {
        return ResponseEntity.ok(statisticsDAO.getCategoryStats());
    }

    /**
     * API — статистика по дням
     */
    @ResponseBody
    @GetMapping("/api/daily")
    public ResponseEntity<List<StatisticsDto.DailyDto>> getDailyStats(
            @RequestParam(value = "days", required = false, defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(statisticsDAO.getDailyStats(days));
    }
}