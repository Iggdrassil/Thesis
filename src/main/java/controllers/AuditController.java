package controllers;

import database.DAO.AuditDAO;
import database.DTO.AuditRecordDto;
import enums.AuditEventType;
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
    public Map<String, Object> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) List<AuditEventType> events,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo
    ) {
        int pageSize = 5;

        int total = auditDAO.countFiltered(events, username, dateFrom, dateTo);
        int totalPages = (int) Math.ceil((double) total / pageSize);

        page = PaginationUtils.safePageNumber(page, totalPages);
        int offset = PaginationUtils.offsetForPage(page, pageSize);

        List<AuditRecordDto> list =
                auditDAO.getPagedFiltered(events, username, dateFrom, dateTo, offset, pageSize);

        return Map.of(
                "records", list,
                "page", page,
                "totalPages", totalPages
        );
    }


}

