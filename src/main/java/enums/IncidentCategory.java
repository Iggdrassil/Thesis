package enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum IncidentCategory {

    DDOS("DDOS"),
    PASSWORD_BRUTEFORCE("Взлом пароля"),
    VULNERABILITY_EXPLOITATION("Эксплуатация уязвимости"),
    NET_SCANNING("Сетевое сканирование"),
    SPYWARE("Работа шпионского ПО"),
    MALWARE("Работа вредоносного ПО"),
    SUSPICIOUS_ACTIVITY("Подозрительная активность"),
    OTHER("Другое");

    private final String name;
}
