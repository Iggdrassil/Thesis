package controllers;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.ui.Model;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/main")
    public String mainPage(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal, Model model) {
        model.addAttribute("username", principal.getUsername());
        String role = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)  // вернёт "ROLE_ADMIN", "ROLE_USER" и т.д.
                .findFirst()
                .orElse("USER");
        model.addAttribute("role", role);

        System.out.println("Role from principal: " + role);
        return "main"; // имя шаблона main.html
    }
}
