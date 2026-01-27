package br.gov.seplag.artistalbum.domain.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Album Entity Tests")
class AlbumTest {

    private Album album;
    private Artist artist;

    @BeforeEach
    void setUp() {
        artist = Artist.builder()
                .id(1L)
                .name("System of a Down")
                .build();

        album = Album.builder()
                .id(1L)
                .title("Toxicity")
                .releaseYear(2001)
                .artist(artist)
                .build();
    }

    @Test
    @DisplayName("Should create album with builder")
    void shouldCreateAlbumWithBuilder() {
        Album newAlbum = Album.builder()
                .title("Mezmerize")
                .releaseYear(2005)
                .artist(artist)
                .build();

        assertThat(newAlbum.getTitle()).isEqualTo("Mezmerize");
        assertThat(newAlbum.getReleaseYear()).isEqualTo(2005);
        assertThat(newAlbum.getArtist()).isEqualTo(artist);
    }

    @Test
    @DisplayName("Should set and get all properties correctly")
    void shouldSetAndGetAllProperties() {
        LocalDateTime now = LocalDateTime.now();

        album.setTitle("Updated Title");
        album.setReleaseYear(2010);
        album.setCreatedAt(now);
        album.setUpdatedAt(now);

        assertThat(album.getTitle()).isEqualTo("Updated Title");
        assertThat(album.getReleaseYear()).isEqualTo(2010);
        assertThat(album.getCreatedAt()).isEqualTo(now);
        assertThat(album.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should add cover to album")
    void shouldAddCoverToAlbum() {
        AlbumCover cover = AlbumCover.builder()
                .fileName("cover.jpg")
                .objectKey("albums/1/cover.jpg")
                .contentType("image/jpeg")
                .fileSize(1024L)
                .build();

        album.addCover(cover);

        assertThat(album.getCovers()).hasSize(1);
        assertThat(album.getCovers()).contains(cover);
        assertThat(cover.getAlbum()).isEqualTo(album);
    }

    @Test
    @DisplayName("Should remove cover from album")
    void shouldRemoveCoverFromAlbum() {
        AlbumCover cover = AlbumCover.builder()
                .fileName("cover.jpg")
                .objectKey("albums/1/cover.jpg")
                .build();

        album.addCover(cover);
        assertThat(album.getCovers()).hasSize(1);

        album.removeCover(cover);
        assertThat(album.getCovers()).isEmpty();
        assertThat(cover.getAlbum()).isNull();
    }

    @Test
    @DisplayName("Should initialize covers list as empty by default")
    void shouldInitializeCoversListAsEmpty() {
        Album newAlbum = Album.builder()
                .title("Test Album")
                .build();

        assertThat(newAlbum.getCovers()).isNotNull();
        assertThat(newAlbum.getCovers()).isEmpty();
    }

    @Test
    @DisplayName("Should handle onCreate lifecycle method")
    void shouldHandleOnCreateLifecycle() {
        Album newAlbum = new Album();
        newAlbum.onCreate();

        assertThat(newAlbum.getCreatedAt()).isNotNull();
        assertThat(newAlbum.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should handle onUpdate lifecycle method")
    void shouldHandleOnUpdateLifecycle() {
        album.setCreatedAt(LocalDateTime.now().minusDays(1));
        LocalDateTime oldUpdatedAt = LocalDateTime.now().minusHours(1);
        album.setUpdatedAt(oldUpdatedAt);

        album.onUpdate();

        assertThat(album.getUpdatedAt()).isAfter(oldUpdatedAt);
    }

    @Test
    @DisplayName("Should create album with no args constructor")
    void shouldCreateAlbumWithNoArgsConstructor() {
        Album newAlbum = new Album();

        assertThat(newAlbum).isNotNull();
        assertThat(newAlbum.getId()).isNull();
        assertThat(newAlbum.getTitle()).isNull();
    }

    @Test
    @DisplayName("Should create album with all args constructor")
    void shouldCreateAlbumWithAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        Album newAlbum = Album.builder()
                .id(2L)
                .title("Hypnotize")
                .releaseYear(2005)
                .artist(artist)
                .covers(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(newAlbum.getId()).isEqualTo(2L);
        assertThat(newAlbum.getTitle()).isEqualTo("Hypnotize");
        assertThat(newAlbum.getReleaseYear()).isEqualTo(2005);
        assertThat(newAlbum.getArtist()).isEqualTo(artist);
    }
}
