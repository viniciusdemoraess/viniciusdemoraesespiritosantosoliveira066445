package br.gov.seplag.artistalbum.domain.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Artist Entity Tests")
class ArtistTest {

    private Artist artist;

    @BeforeEach
    void setUp() {
        artist = Artist.builder()
                .id(1L)
                .name("System of a Down")
                .build();
    }

    @Test
    @DisplayName("Should create artist with builder")
    void shouldCreateArtistWithBuilder() {
        Artist newArtist = Artist.builder()
                .name("Metallica")
                .build();

        assertThat(newArtist.getName()).isEqualTo("Metallica");
    }

    @Test
    @DisplayName("Should set and get all properties correctly")
    void shouldSetAndGetAllProperties() {
        LocalDateTime now = LocalDateTime.now();

        artist.setName("Updated Name");
        artist.setCreatedAt(now);
        artist.setUpdatedAt(now);

        assertThat(artist.getName()).isEqualTo("Updated Name");
        assertThat(artist.getCreatedAt()).isEqualTo(now);
        assertThat(artist.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should add album to artist")
    void shouldAddAlbumToArtist() {
        Album album = Album.builder()
                .title("Toxicity")
                .releaseYear(2001)
                .build();

        artist.addAlbum(album);

        assertThat(artist.getAlbums()).hasSize(1);
        assertThat(artist.getAlbums()).contains(album);
        assertThat(album.getArtists()).contains(artist);
    }

    @Test
    @DisplayName("Should remove album from artist")
    void shouldRemoveAlbumFromArtist() {
        Album album = Album.builder()
                .title("Toxicity")
                .releaseYear(2001)
                .build();

        artist.addAlbum(album);
        assertThat(artist.getAlbums()).hasSize(1);

        artist.removeAlbum(album);
        assertThat(artist.getAlbums()).isEmpty();
        assertThat(album.getArtists()).isEmpty();
    }

    @Test
    @DisplayName("Should initialize albums list as empty by default")
    void shouldInitializeAlbumsListAsEmpty() {
        Artist newArtist = Artist.builder()
                .name("Test Artist")
                .build();

        assertThat(newArtist.getAlbums()).isNotNull();
        assertThat(newArtist.getAlbums()).isEmpty();
    }

    @Test
    @DisplayName("Should handle onCreate lifecycle method")
    void shouldHandleOnCreateLifecycle() {
        Artist newArtist = new Artist();
        newArtist.onCreate();

        assertThat(newArtist.getCreatedAt()).isNotNull();
        assertThat(newArtist.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should handle onUpdate lifecycle method")
    void shouldHandleOnUpdateLifecycle() {
        artist.setCreatedAt(LocalDateTime.now().minusDays(1));
        LocalDateTime oldUpdatedAt = LocalDateTime.now().minusHours(1);
        artist.setUpdatedAt(oldUpdatedAt);

        artist.onUpdate();

        assertThat(artist.getUpdatedAt()).isAfter(oldUpdatedAt);
    }

    @Test
    @DisplayName("Should create artist with no args constructor")
    void shouldCreateArtistWithNoArgsConstructor() {
        Artist newArtist = new Artist();

        assertThat(newArtist).isNotNull();
        assertThat(newArtist.getId()).isNull();
        assertThat(newArtist.getName()).isNull();
    }

    @Test
    @DisplayName("Should create artist with all args constructor")
    void shouldCreateArtistWithAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        Artist newArtist = Artist.builder()
                .id(2L)
                .name("Metallica")
                .albums(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(newArtist.getId()).isEqualTo(2L);
        assertThat(newArtist.getName()).isEqualTo("Metallica");
        assertThat(newArtist.getCreatedAt()).isEqualTo(now);
        assertThat(newArtist.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should add multiple albums to artist")
    void shouldAddMultipleAlbumsToArtist() {
        Album album1 = Album.builder().title("Toxicity").releaseYear(2001).build();
        Album album2 = Album.builder().title("Mezmerize").releaseYear(2005).build();

        artist.addAlbum(album1);
        artist.addAlbum(album2);

        assertThat(artist.getAlbums()).hasSize(2);
        assertThat(artist.getAlbums()).containsExactly(album1, album2);
    }
}
