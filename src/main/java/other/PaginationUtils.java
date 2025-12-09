package other;

import database.DTO.PageResultDTO;

import java.util.Collections;
import java.util.List;

public class PaginationUtils {

    /**
     * Пагинация списка в памяти
     */
    public static <T> PageResultDTO<T> paginateList(List<T> data, int page, int pageSize) {

        if (data == null || data.isEmpty()) {
            return new PageResultDTO<>(Collections.emptyList(), 1, 1);
        }

        int totalPages = Math.max(1, (int) Math.ceil((double) data.size() / pageSize));

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, data.size());

        List<T> slice = data.subList(start, end);

        return new PageResultDTO<>(slice, page, totalPages);
    }

    /**
     * Пагинация через totalCount + limit-offset (для аудита)
     */
    public static int safePageNumber(int page, int totalPages) {
        if (totalPages < 1) totalPages = 1;
        if (page < 1) return 1;
        return Math.min(page, totalPages);
    }

    public static int offsetForPage(int page, int pageSize) {
        return Math.max(0, (page - 1) * pageSize);
    }
}
