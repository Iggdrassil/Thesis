package database.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class PageResultDTO<T> {
    private final List<T> content;
    private final int page;
    private final int totalPages;
}
