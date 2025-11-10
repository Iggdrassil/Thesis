package enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum IncidentRecommendation {

    ISOLATE_AFFECTED_SYSTEM("Изолировать затронутую систему от сети"),
    CHANGE_COMPROMISED_PASSWORDS("Сменить пароли для затронутых учётных записей"),
    PERFORM_MALWARE_SCAN("Провести проверку на наличие вредоносного ПО"),
    NOTIFY_SECURITY_TEAM("Сообщить в службу информационной безопасности"),
    ANALYZE_LOGS("Проанализировать журналы событий"),
    UPDATE_SOFTWARE("Обновить программное обеспечение и системы безопасности"),
    CHECK_BACKUPS("Проверить целостность и актуальность резервных копий"),
    RESTRICT_ACCESS("Ограничить доступ к затронутым данным и системам"),
    DOCUMENT_INCIDENT("Задокументировать инцидент и предпринятые меры"),
    NOTIFY_MANAGEMENT("Сообщить руководству организации"),
    COLLECT_EVIDENCE("Собрать цифровые доказательства и сохранить их в защищённом месте"),
    INFORM_USERS_IF_NEEDED("При необходимости уведомить пользователей или клиентов"),
    RESTORE_FROM_BACKUP("Восстановить систему из резервной копии"),
    PERFORM_SECURITY_AUDIT("Провести дополнительный аудит безопасности после инцидента"),
    UPDATE_SECURITY_POLICIES("Пересмотреть и обновить политики информационной безопасности");

    private final String localizedValue;

}
