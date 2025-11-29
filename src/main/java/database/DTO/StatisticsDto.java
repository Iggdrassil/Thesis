package database.DTO;

public class StatisticsDto {
    public record ImportanceDto(String level, String localizedLevel, long count) {}
    public record CategoryDto(String category, String localizedCategory, long count) {}
    public record DailyDto(String day, long count) {}
}
