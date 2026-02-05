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

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Toxicity");
        assertThat(response.releaseYear()).isEqualTo(2001);
        assertThat(response.artistId()).isEqualTo(1L);
        assertThat(response.artistName()).isEqualTo("System of a Down");
        assertThat(response.covers()).hasSize(1);
        assertThat(response.createdAt()).isNotNull();
        assertThat(response.updatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should create with builder and all properties")
    void shouldCreateWithBuilderAndAllProperties() {
        LocalDateTime now = LocalDateTime.now();
        List<AlbumCoverResponse> covers = Arrays.asList(
                AlbumCoverResponse.builder().id(1L).fileName("cover1.jpg").build(),
                AlbumCoverResponse.builder().id(2L).fileName("cover2.jpg").build()
        );

        AlbumResponse response = AlbumResponse.builder()
                .id(2L)
                .title("Mezmerize")
                .releaseYear(2005)
                .artistId(2L)
                .artistName("SOAD")
                .covers(covers)
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(response.id()).isEqualTo(2L);
        assertThat(response.title()).isEqualTo("Mezmerize");
        assertThat(response.releaseYear()).isEqualTo(2005);
        assertThat(response.artistId()).isEqualTo(2L);
        assertThat(response.artistName()).isEqualTo("SOAD");
        assertThat(response.covers()).hasSize(2);
        assertThat(response.createdAt()).isEqualTo(now);
        assertThat(response.updatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should create with minimal builder")
    void shouldCreateWithMinimalBuilder() {
        AlbumResponse response = AlbumResponse.builder()
                .id(1L)
                .title("Minimal Album")
                .build();

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Minimal Album");
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

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.title()).isEqualTo("Hypnotize");
        assertThat(response.releaseYear()).isEqualTo(2005);
        assertThat(response.artistId()).isEqualTo(3L);
        assertThat(response.artistName()).isEqualTo("Artist Name");
        assertThat(response.covers()).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty covers list")
    void shouldHandleEmptyCoversList() {
        AlbumResponse response = AlbumResponse.builder()
                .id(1L)
                .title("Album Without Covers")
                .covers(Collections.emptyList())
                .build();

        assertThat(response.covers()).isEmpty();
    }

    @Test
    @DisplayName("Should handle null release year")
    void shouldHandleNullReleaseYear() {
        AlbumResponse response = AlbumResponse.builder()
                .id(1L)
                .title("Unknown Year Album")
                .build();

        assertThat(response.releaseYear()).isNull();
    }
}
