package controllers;

import database.DAO.AuditDAO;
import database.DAO.IncidentDAO;
import database.DTO.AuditRecordDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import services.AuditService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/audit")
public class AuditController {

    private final AuditService service;
    private AuditDAO auditDAO;

    @Autowired
    public AuditController(AuditService service, AuditDAO auditDAO) {
        this.service = service;
        this.auditDAO = auditDAO;
    }

    @GetMapping
    public String auditPage() {
        return "audit"; // audit.html
    }

    @GetMapping("/list")
    @ResponseBody
    public Map<String, Object> getList(
            @RequestParam(defaultValue = "1") int page
    ) {
        int pageSize = 5;

        int total = auditDAO.count();
        int totalPages = (int) Math.ceil((double) total / pageSize);

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        int from = (page - 1) * pageSize;

        List<AuditRecordDto> list = auditDAO.getPaged(from, pageSize);

        Map<String, Object> response = new HashMap<>();
        response.put("records", list);
        response.put("page", page);
        response.put("totalPages", totalPages);

        return response;
    }

}

