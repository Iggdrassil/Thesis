package database.DTO;

public class StatisticsDto {
    public record ImportanceDto(String level, long count) {}
    public record CategoryDto(String category, long count) {}
    public record DailyDto(String day, long count) {}
}
