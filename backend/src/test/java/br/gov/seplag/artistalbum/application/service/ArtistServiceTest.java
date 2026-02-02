package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.ArtistRequest;
import br.gov.seplag.artistalbum.application.io.ArtistResponse;
import br.gov.seplag.artistalbum.domain.entity.Artist;
import br.gov.seplag.artistalbum.domain.repository.ArtistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Artist Service Tests")
class ArtistServiceTest {

    @Mock
    private ArtistRepository artistRepository;

    @InjectMocks
    private ArtistService artistService;

    private Artist testArtist;
    private ArtistRequest artistRequest;

    @BeforeEach
    void setUp() {
        testArtist = Artist.builder()
                .id(1L)
                .name("Serj Tankian")
                .albums(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        artistRequest = ArtistRequest.builder()
                .name("Serj Tankian")
                .build();
    }

    @Test
    @DisplayName("Should create artist successfully")
    void shouldCreateArtistSuccessfully() {
        when(artistRepository.existsByNameIgnoreCase(anyString())).thenReturn(false);
        when(artistRepository.save(any(Artist.class))).thenReturn(testArtist);

        ArtistResponse response = artistService.createArtist(artistRequest);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Serj Tankian");
        verify(artistRepository, times(1)).save(any(Artist.class));
    }

    @Test
    @DisplayName("Should throw exception when creating artist with duplicate name")
    void shouldThrowExceptionWhenCreatingDuplicateArtist() {
        when(artistRepository.existsByNameIgnoreCase(anyString())).thenReturn(true);

        assertThatThrownBy(() -> artistService.createArtist(artistRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");

        verify(artistRepository, never()).save(any(Artist.class));
    }

    @Test
    @DisplayName("Should get artist by ID successfully")
    void shouldGetArtistByIdSuccessfully() {
        when(artistRepository.findById(1L)).thenReturn(Optional.of(testArtist));

        ArtistResponse response = artistService.getArtistById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Serj Tankian");
    }

    @Test
    @DisplayName("Should throw exception when artist not found")
    void shouldThrowExceptionWhenArtistNotFound() {
        when(artistRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> artistService.getArtistById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("Should get all artists with pagination")
    void shouldGetAllArtistsWithPagination() {
        List<Artist> artists = List.of(testArtist);
        Page<Artist> page = new PageImpl<>(artists);
        Pageable pageable = PageRequest.of(0, 10);

        when(artistRepository.findAll(pageable)).thenReturn(page);

        Page<ArtistResponse> response = artistService.getAllArtists(null, pageable);

        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getName()).isEqualTo("Serj Tankian");
    }

    @Test
    @DisplayName("Should update artist successfully")
    void shouldUpdateArtistSuccessfully() {
        when(artistRepository.findById(1L)).thenReturn(Optional.of(testArtist));
        when(artistRepository.existsByNameIgnoreCaseAndIdNot(anyString(), anyLong())).thenReturn(false);
        when(artistRepository.save(any(Artist.class))).thenReturn(testArtist);

        ArtistRequest updateRequest = ArtistRequest.builder()
                .name("Serj Tankian Updated")
                .build();

        ArtistResponse response = artistService.updateArtist(1L, updateRequest);

        assertThat(response).isNotNull();
        verify(artistRepository, times(1)).save(any(Artist.class));
    }

    @Test
    @DisplayName("Should delete artist successfully")
    void shouldDeleteArtistSuccessfully() {
        when(artistRepository.existsById(1L)).thenReturn(true);
        doNothing().when(artistRepository).deleteById(1L);

        artistService.deleteArtist(1L);

        verify(artistRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent artist")
    void shouldThrowExceptionWhenDeletingNonExistentArtist() {
        when(artistRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> artistService.deleteArtist(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");

        verify(artistRepository, never()).deleteById(anyLong());
    }
}
