package controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SettingsController {
    @GetMapping("/settings")
    @Operation(summary = "Открыть страницу настроек")
    public String settingsPage() {
        return "settings"; // шаблон settings.html
    }
}
