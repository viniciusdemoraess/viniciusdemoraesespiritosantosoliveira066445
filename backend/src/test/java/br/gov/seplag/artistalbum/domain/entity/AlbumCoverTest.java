package br.gov.seplag.artistalbum.domain.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AlbumCover Entity Tests")
class AlbumCoverTest {

    private AlbumCover albumCover;
    private Album album;

    @BeforeEach
    void setUp() {
        album = Album.builder()
                .id(1L)
                .title("Toxicity")
                .build();

        albumCover = AlbumCover.builder()
                .id(1L)
                .fileName("cover.jpg")
                .objectKey("albums/1/cover.jpg")
                .contentType("image/jpeg")
                .fileSize(2048L)
                .album(album)
                .build();
    }

    @Test
    @DisplayName("Should create album cover with builder")
    void shouldCreateAlbumCoverWithBuilder() {
        AlbumCover newCover = AlbumCover.builder()
                .fileName("cover2.jpg")
                .objectKey("albums/2/cover2.jpg")
                .contentType("image/png")
                .fileSize(4096L)
                .album(album)
                .build();

        assertThat(newCover.getFileName()).isEqualTo("cover2.jpg");
        assertThat(newCover.getObjectKey()).isEqualTo("albums/2/cover2.jpg");
        assertThat(newCover.getContentType()).isEqualTo("image/png");
        assertThat(newCover.getFileSize()).isEqualTo(4096L);
        assertThat(newCover.getAlbum()).isEqualTo(album);
    }

    @Test
    @DisplayName("Should set and get all properties correctly")
    void shouldSetAndGetAllProperties() {
        LocalDateTime now = LocalDateTime.now();

        albumCover.setFileName("updated-cover.jpg");
        albumCover.setObjectKey("albums/1/updated-cover.jpg");
        albumCover.setContentType("image/webp");
        albumCover.setFileSize(8192L);
        albumCover.setCreatedAt(now);

        assertThat(albumCover.getFileName()).isEqualTo("updated-cover.jpg");
        assertThat(albumCover.getObjectKey()).isEqualTo("albums/1/updated-cover.jpg");
        assertThat(albumCover.getContentType()).isEqualTo("image/webp");
        assertThat(albumCover.getFileSize()).isEqualTo(8192L);
        assertThat(albumCover.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should handle onCreate lifecycle method")
    void shouldHandleOnCreateLifecycle() {
        AlbumCover newCover = new AlbumCover();
        newCover.onCreate();

        assertThat(newCover.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should create album cover with no args constructor")
    void shouldCreateAlbumCoverWithNoArgsConstructor() {
        AlbumCover newCover = new AlbumCover();

        assertThat(newCover).isNotNull();
        assertThat(newCover.getId()).isNull();
        assertThat(newCover.getFileName()).isNull();
    }

    @Test
    @DisplayName("Should create album cover with all args constructor")
    void shouldCreateAlbumCoverWithAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        AlbumCover newCover = new AlbumCover(
                2L,
                "test.jpg",
                "albums/test.jpg",
                "image/jpeg",
                1024L,
                album,
                now
        );

        assertThat(newCover.getId()).isEqualTo(2L);
        assertThat(newCover.getFileName()).isEqualTo("test.jpg");
        assertThat(newCover.getObjectKey()).isEqualTo("albums/test.jpg");
        assertThat(newCover.getContentType()).isEqualTo("image/jpeg");
        assertThat(newCover.getFileSize()).isEqualTo(1024L);
        assertThat(newCover.getAlbum()).isEqualTo(album);
        assertThat(newCover.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should associate with album correctly")
    void shouldAssociateWithAlbumCorrectly() {
        Album newAlbum = Album.builder()
                .id(2L)
                .title("Mezmerize")
                .build();

        albumCover.setAlbum(newAlbum);

        assertThat(albumCover.getAlbum()).isEqualTo(newAlbum);
        assertThat(albumCover.getAlbum().getId()).isEqualTo(2L);
    }
}
