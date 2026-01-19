package br.gov.seplag.artistalbum.infrastructure.websocket;

import br.gov.seplag.artistalbum.domain.entity.Album;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket Notification Service
 * Sends real-time notifications to connected clients
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void notifyNewAlbum(Album album) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "NEW_ALBUM");
            notification.put("albumId", album.getId());
            notification.put("albumTitle", album.getTitle());
            notification.put("artistId", album.getArtist().getId());
            notification.put("artistName", album.getArtist().getName());
            notification.put("timestamp", LocalDateTime.now());
            notification.put("message", String.format("New album '%s' by %s has been added!", 
                    album.getTitle(), album.getArtist().getName()));

            messagingTemplate.convertAndSend("/topic/albums", notification);
            log.info("WebSocket notification sent for new album: {}", album.getTitle());
        } catch (Exception e) {
            log.error("Error sending WebSocket notification", e);
        }
    }
}
