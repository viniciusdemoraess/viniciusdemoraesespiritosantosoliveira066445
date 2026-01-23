package br.gov.seplag.artistalbum.infrastructure.websocket;

import br.gov.seplag.artistalbum.domain.entity.Album;
import br.gov.seplag.artistalbum.domain.entity.Artist;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketNotificationServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private WebSocketNotificationService webSocketNotificationService;

    @Captor
    private ArgumentCaptor<Map<String, Object>> notificationCaptor;

    private Artist testArtist;
    private Album testAlbum;

    @BeforeEach
    void setUp() {
        testArtist = Artist.builder()
                .id(1L)
                .name("System of a Down")
                .build();

        testAlbum = Album.builder()
                .id(1L)
                .title("Toxicity")
                .releaseYear(2001)
                .artist(testArtist)
                .build();
    }

    @Test
    @DisplayName("Should send notification for new album successfully")
    void shouldSendNotificationForNewAlbum() {
        // Given
        doNothing().when(messagingTemplate).convertAndSend(anyString(), any(Map.class));

        // When
        webSocketNotificationService.notifyNewAlbum(testAlbum);

        // Then
        verify(messagingTemplate).convertAndSend(eq("/topic/albums"), notificationCaptor.capture());
        
        Map<String, Object> notification = notificationCaptor.getValue();
        assertThat(notification).isNotNull();
        assertThat(notification.get("type")).isEqualTo("NEW_ALBUM");
        assertThat(notification.get("albumId")).isEqualTo(1L);
        assertThat(notification.get("albumTitle")).isEqualTo("Toxicity");
        assertThat(notification.get("artistId")).isEqualTo(1L);
        assertThat(notification.get("artistName")).isEqualTo("System of a Down");
        assertThat(notification.get("message")).isEqualTo("New album 'Toxicity' by System of a Down has been added!");
        assertThat(notification.get("timestamp")).isInstanceOf(LocalDateTime.class);
    }

    @Test
    @DisplayName("Should handle exception when sending notification fails")
    void shouldHandleExceptionWhenSendingFails() {
        // Given
        doThrow(new RuntimeException("WebSocket error"))
                .when(messagingTemplate).convertAndSend(anyString(), any(Map.class));

        // When & Then - Should not throw exception (error is logged)
        assertThatCode(() -> webSocketNotificationService.notifyNewAlbum(testAlbum))
                .doesNotThrowAnyException();
        
        verify(messagingTemplate).convertAndSend(eq("/topic/albums"), any(Map.class));
    }

    @Test
    @DisplayName("Should send notification with correct topic destination")
    void shouldSendNotificationWithCorrectTopic() {
        // Given
        doNothing().when(messagingTemplate).convertAndSend(anyString(), any(Map.class));

        // When
        webSocketNotificationService.notifyNewAlbum(testAlbum);

        // Then
        verify(messagingTemplate).convertAndSend(eq("/topic/albums"), any(Map.class));
    }

    @Test
    @DisplayName("Should include all required fields in notification")
    void shouldIncludeAllRequiredFields() {
        // Given
        doNothing().when(messagingTemplate).convertAndSend(anyString(), any(Map.class));

        // When
        webSocketNotificationService.notifyNewAlbum(testAlbum);

        // Then
        verify(messagingTemplate).convertAndSend(eq("/topic/albums"), notificationCaptor.capture());
        
        Map<String, Object> notification = notificationCaptor.getValue();
        assertThat(notification).containsKeys(
                "type", "albumId", "albumTitle", 
                "artistId", "artistName", "timestamp", "message"
        );
    }

    @Test
    @DisplayName("Should create notification with album and artist details")
    void shouldCreateNotificationWithDetails() {
        // Given
        Album album = Album.builder()
                .id(99L)
                .title("Mezmerize")
                .releaseYear(2005)
                .artist(Artist.builder()
                        .id(10L)
                        .name("SOAD")
                        .build())
                .build();

        doNothing().when(messagingTemplate).convertAndSend(anyString(), any(Map.class));

        // When
        webSocketNotificationService.notifyNewAlbum(album);

        // Then
        verify(messagingTemplate).convertAndSend(eq("/topic/albums"), notificationCaptor.capture());
        
        Map<String, Object> notification = notificationCaptor.getValue();
        assertThat(notification.get("albumId")).isEqualTo(99L);
        assertThat(notification.get("albumTitle")).isEqualTo("Mezmerize");
        assertThat(notification.get("artistId")).isEqualTo(10L);
        assertThat(notification.get("artistName")).isEqualTo("SOAD");
    }
}
