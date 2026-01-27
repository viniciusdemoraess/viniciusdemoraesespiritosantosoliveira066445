package br.gov.seplag.artistalbum.application.io;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AlbumResponse Tests")
class AlbumResponseTest {

    @Test
    @DisplayName("Should create album response with builder")
    void shouldCreateAlbumResponseWithBuilder() {
        AlbumCoverResponse cover = AlbumCoverResponse.builder()
                .id(1L)
                .fileName("cover.jpg")
                .build();

        AlbumResponse response = AlbumResponse.builder()
                .id(1L)
                .title("Toxicity")
                .releaseYear(2001)
                .artistId(1L)
                .artistName("System of a Down")
                .covers(Collections.singletonList(cover))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Toxicity");
        assertThat(response.getReleaseYear()).isEqualTo(2001);
        assertThat(response.getArtistId()).isEqualTo(1L);
        assertThat(response.getArtistName()).isEqualTo("System of a Down");
        assertThat(response.getCovers()).hasSize(1);
        assertThat(response.getCreatedAt()).isNotNull();
        assertThat(response.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should set and get all properties correctly")
    void shouldSetAndGetAllPropertiesCorrectly() {
        LocalDateTime now = LocalDateTime.now();
        List<AlbumCoverResponse> covers = Arrays.asList(
                AlbumCoverResponse.builder().id(1L).fileName("cover1.jpg").build(),
                AlbumCoverResponse.builder().id(2L).fileName("cover2.jpg").build()
        );

        AlbumResponse response = new AlbumResponse();
        response.setId(2L);
        response.setTitle("Mezmerize");
        response.setReleaseYear(2005);
        response.setArtistId(2L);
        response.setArtistName("SOAD");
        response.setCovers(covers);
        response.setCreatedAt(now);
        response.setUpdatedAt(now);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getTitle()).isEqualTo("Mezmerize");
        assertThat(response.getReleaseYear()).isEqualTo(2005);
        assertThat(response.getArtistId()).isEqualTo(2L);
        assertThat(response.getArtistName()).isEqualTo("SOAD");
        assertThat(response.getCovers()).hasSize(2);
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should create with no args constructor")
    void shouldCreateWithNoArgsConstructor() {
        AlbumResponse response = new AlbumResponse();

        assertThat(response).isNotNull();
        assertThat(response.getId()).isNull();
        assertThat(response.getTitle()).isNull();
    }

    @Test
    @DisplayName("Should create with all args constructor")
    void shouldCreateWithAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        List<AlbumCoverResponse> covers = Collections.emptyList();

        AlbumResponse response = AlbumResponse.builder()
                .id(3L)
                .title("Hypnotize")
                .releaseYear(2005)
                .artistId(3L)
                .artistName("Artist Name")
                .covers(covers)
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(response.getId()).isEqualTo(3L);
        assertThat(response.getTitle()).isEqualTo("Hypnotize");
        assertThat(response.getReleaseYear()).isEqualTo(2005);
        assertThat(response.getArtistId()).isEqualTo(3L);
        assertThat(response.getArtistName()).isEqualTo("Artist Name");
        assertThat(response.getCovers()).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty covers list")
    void shouldHandleEmptyCoversList() {
        AlbumResponse response = AlbumResponse.builder()
                .id(1L)
                .title("Album Without Covers")
                .covers(Collections.emptyList())
                .build();

        assertThat(response.getCovers()).isEmpty();
    }

    @Test
    @DisplayName("Should handle null release year")
    void shouldHandleNullReleaseYear() {
        AlbumResponse response = AlbumResponse.builder()
                .id(1L)
                .title("Unknown Year Album")
                .build();

        assertThat(response.getReleaseYear()).isNull();
    }
}
