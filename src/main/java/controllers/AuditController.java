package controllers;

import database.DAO.AuditDAO;
import database.DTO.AuditRecordDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import other.PaginationUtils;
import services.AuditService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/audit")
public class AuditController {

    private AuditDAO auditDAO;

    @Autowired
    public AuditController(AuditDAO auditDAO) {
        this.auditDAO = auditDAO;
    }

    @GetMapping
    public String auditPage() {
        return "audit"; // audit.html
    }

    @GetMapping("/list")
    @ResponseBody
    public Map<String, Object> getList(@RequestParam(defaultValue = "1") int page) {
        log.info("Requesting list of audit records");

        int total = auditDAO.count();
        int pageSize = 5;

        int totalPages = (int) Math.ceil((double) total / pageSize);
        page = PaginationUtils.safePageNumber(page, totalPages);

        int offset = PaginationUtils.offsetForPage(page, pageSize);

        List<AuditRecordDto> list = auditDAO.getPaged(offset, pageSize);

        Map<String, Object> response = new HashMap<>();

        response.put("records", list);
        response.put("page", page);
        response.put("totalPages", totalPages);

        return response;
    }

}

