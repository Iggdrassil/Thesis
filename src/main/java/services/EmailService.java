package services;

import database.models.EmailSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

@Service
@Component
public class EmailService {

    public void sendEmail(EmailSettings s, String subject, String body) throws MessagingException {
        Properties props = new Properties();

        props.put("mail.smtp.host", s.getSmtpHost());
        props.put("mail.smtp.port", s.getSmtpPort());
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", s.getSmtpHost()); // доверять SSL сертификату сервера

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(s.getSmtpUsername(), s.getSmtpPassword());
            }
        });

        session.setDebug(true); // включить вывод логов для отладки

        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(s.getSmtpUsername()));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(s.getRecipientEmail()));
        message.setSubject(subject, "UTF-8");
        message.setText(body, "UTF-8");

        Transport transport = session.getTransport("smtp");
        transport.connect(s.getSmtpHost(), s.getSmtpPort(), s.getSmtpUsername(), s.getSmtpPassword());
        transport.sendMessage(message, message.getAllRecipients());
        transport.close();
    }
}

