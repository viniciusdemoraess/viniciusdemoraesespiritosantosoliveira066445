package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.AlbumRequest;
import br.gov.seplag.artistalbum.application.io.AlbumResponse;
import br.gov.seplag.artistalbum.domain.entity.Album;
import br.gov.seplag.artistalbum.domain.entity.AlbumCover;
import br.gov.seplag.artistalbum.domain.entity.Artist;
import br.gov.seplag.artistalbum.domain.exception.DuplicateResourceException;
import br.gov.seplag.artistalbum.domain.exception.InvalidFileException;
import br.gov.seplag.artistalbum.domain.exception.ResourceNotFoundException;
import br.gov.seplag.artistalbum.domain.repository.AlbumCoverRepository;
import br.gov.seplag.artistalbum.domain.repository.AlbumRepository;
import br.gov.seplag.artistalbum.domain.repository.ArtistRepository;
import br.gov.seplag.artistalbum.infrastructure.storage.MinioStorageService;
import br.gov.seplag.artistalbum.infrastructure.websocket.WebSocketNotificationService;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Album Service Tests")
class AlbumServiceTest {

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private AlbumCoverRepository albumCoverRepository;

    @Mock
    private MinioStorageService minioStorageService;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    @InjectMocks
    private AlbumService albumService;

    private Artist testArtist;
    private Album testAlbum;
    private AlbumRequest albumRequest;

    @BeforeEach
    void setUp() {
        testArtist = Artist.builder()
                .id(1L)
                .name("System of a Down")
                .albums(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testAlbum = Album.builder()
                .id(1L)
                .title("Toxicity")
                .releaseYear(2001)
                .artist(testArtist)
                .covers(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        albumRequest = new AlbumRequest("Toxicity", 2001, 1L);
    }

    @Test
    @DisplayName("Should get all albums without filters")
    void shouldGetAllAlbumsWithoutFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Album> albumPage = new PageImpl<>(List.of(testAlbum));

        when(albumRepository.findAll(pageable)).thenReturn(albumPage);

        Page<AlbumResponse> result = albumService.getAllAlbums(null, null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Toxicity");
        verify(albumRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should get albums by artist id")
    void shouldGetAlbumsByArtistId() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Album> albumPage = new PageImpl<>(List.of(testAlbum));

        when(albumRepository.findByArtistId(1L, pageable)).thenReturn(albumPage);

        Page<AlbumResponse> result = albumService.getAllAlbums(1L, null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(albumRepository).findByArtistId(1L, pageable);
    }

    @Test
    @DisplayName("Should get albums by title")
    void shouldGetAlbumsByTitle() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Album> albumPage = new PageImpl<>(List.of(testAlbum));

        when(albumRepository.findByTitleContainingIgnoreCase("Toxicity", pageable)).thenReturn(albumPage);

        Page<AlbumResponse> result = albumService.getAllAlbums(null, "Toxicity", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(albumRepository).findByTitleContainingIgnoreCase("Toxicity", pageable);
    }

    @Test
    @DisplayName("Should get albums by artist id and title")
    void shouldGetAlbumsByArtistIdAndTitle() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Album> albumPage = new PageImpl<>(List.of(testAlbum));

        when(albumRepository.findByArtistIdAndTitleContainingIgnoreCase(1L, "Toxicity", pageable))
                .thenReturn(albumPage);

        Page<AlbumResponse> result = albumService.getAllAlbums(1L, "Toxicity", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(albumRepository).findByArtistIdAndTitleContainingIgnoreCase(1L, "Toxicity", pageable);
    }

    @Test
    @DisplayName("Should get album by id")
    void shouldGetAlbumById() {
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));

        AlbumResponse result = albumService.getAlbumById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Toxicity");
        assertThat(result.getReleaseYear()).isEqualTo(2001);
        verify(albumRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when album not found by id")
    void shouldThrowExceptionWhenAlbumNotFoundById() {
        when(albumRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> albumService.getAlbumById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Album");
    }

    @Test
    @DisplayName("Should create album successfully")
    void shouldCreateAlbumSuccessfully() {
        when(artistRepository.findById(1L)).thenReturn(Optional.of(testArtist));
        when(albumRepository.existsByTitleAndArtistId("Toxicity", 1L)).thenReturn(false);
        when(albumRepository.save(any(Album.class))).thenReturn(testAlbum);

        AlbumResponse result = albumService.createAlbum(albumRequest);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Toxicity");
        verify(artistRepository).findById(1L);
        verify(albumRepository).existsByTitleAndArtistId("Toxicity", 1L);
        verify(albumRepository).save(any(Album.class));
        verify(webSocketNotificationService).notifyNewAlbum(any(Album.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when artist not found during album creation")
    void shouldThrowExceptionWhenArtistNotFoundDuringCreation() {
        when(artistRepository.findById(999L)).thenReturn(Optional.empty());

        AlbumRequest request = new AlbumRequest("Test Album", 2024, 999L);

        assertThatThrownBy(() -> albumService.createAlbum(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Artist");
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when album already exists")
    void shouldThrowExceptionWhenAlbumAlreadyExists() {
        when(artistRepository.findById(1L)).thenReturn(Optional.of(testArtist));
        when(albumRepository.existsByTitleAndArtistId("Toxicity", 1L)).thenReturn(true);

        assertThatThrownBy(() -> albumService.createAlbum(albumRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Album");
    }

    @Test
    @DisplayName("Should delete album successfully")
    void shouldDeleteAlbumSuccessfully() {
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));
        doNothing().when(albumRepository).deleteById(1L);

        albumService.deleteAlbum(1L);

        verify(albumRepository).findById(1L);
        verify(albumRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent album")
    void shouldThrowExceptionWhenDeletingNonExistentAlbum() {
        when(albumRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> albumService.deleteAlbum(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Album");
    }

    @Test
    @DisplayName("Should update album successfully")
    void shouldUpdateAlbumSuccessfully() {
        AlbumRequest updateRequest = new AlbumRequest("Updated Title", 2024, 1L);
        
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));
        when(artistRepository.findById(1L)).thenReturn(Optional.of(testArtist));
        when(albumRepository.existsByTitleAndArtistIdAndIdNot("Updated Title", 1L, 1L)).thenReturn(false);
        when(albumRepository.save(any(Album.class))).thenReturn(testAlbum);

        AlbumResponse result = albumService.updateAlbum(1L, updateRequest);

        assertThat(result).isNotNull();
        verify(albumRepository).findById(1L);
        verify(artistRepository).findById(1L);
        verify(albumRepository).existsByTitleAndArtistIdAndIdNot("Updated Title", 1L, 1L);
        verify(albumRepository).save(any(Album.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent album")
    void shouldThrowExceptionWhenUpdatingNonExistentAlbum() {
        AlbumRequest updateRequest = new AlbumRequest("Updated Title", 2024, 1L);
        
        when(albumRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> albumService.updateAlbum(999L, updateRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Album");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating album with non-existent artist")
    void shouldThrowExceptionWhenUpdatingAlbumWithNonExistentArtist() {
        AlbumRequest updateRequest = new AlbumRequest("Updated Title", 2024, 999L);
        
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));
        when(artistRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> albumService.updateAlbum(1L, updateRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Artist");
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when updating to existing title")
    void shouldThrowExceptionWhenUpdatingToExistingTitle() {
        AlbumRequest updateRequest = new AlbumRequest("Existing Title", 2024, 1L);
        
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));
        when(artistRepository.findById(1L)).thenReturn(Optional.of(testArtist));
        when(albumRepository.existsByTitleAndArtistIdAndIdNot("Existing Title", 1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> albumService.updateAlbum(1L, updateRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Album");
    }

    @Test
    @DisplayName("Should upload covers successfully")
    void shouldUploadCoversSuccessfully() {
        MockMultipartFile file1 = new MockMultipartFile(
                "files", 
                "cover1.jpg", 
                "image/jpeg", 
                "test image content".getBytes()
        );
        
        MockMultipartFile file2 = new MockMultipartFile(
                "files", 
                "cover2.png", 
                "image/png", 
                "test image content".getBytes()
        );
        
        List<MultipartFile> files = List.of(file1, file2);
        
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));
        when(minioStorageService.uploadFile(any(MultipartFile.class), eq("covers")))
                .thenReturn("covers/test-key-1", "covers/test-key-2");
        when(albumRepository.save(any(Album.class))).thenReturn(testAlbum);

        AlbumResponse result = albumService.uploadCovers(1L, files);

        assertThat(result).isNotNull();
        verify(albumRepository).findById(1L);
        verify(minioStorageService, times(2)).uploadFile(any(MultipartFile.class), eq("covers"));
        verify(albumRepository).save(any(Album.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when uploading covers for non-existent album")
    void shouldThrowExceptionWhenUploadingCoversForNonExistentAlbum() {
        MockMultipartFile file = new MockMultipartFile(
                "file", 
                "cover.jpg", 
                "image/jpeg", 
                "test".getBytes()
        );
        
        when(albumRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> albumService.uploadCovers(999L, List.of(file)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Album");
    }

    @Test
    @DisplayName("Should throw InvalidFileException when file is empty")
    void shouldThrowExceptionWhenFileIsEmpty() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", 
                "empty.jpg", 
                "image/jpeg", 
                new byte[0]
        );
        
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));

        assertThatThrownBy(() -> albumService.uploadCovers(1L, List.of(emptyFile)))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("File is empty");
    }

    @Test
    @DisplayName("Should throw InvalidFileException when file is not an image")
    void shouldThrowExceptionWhenFileIsNotAnImage() {
        MockMultipartFile textFile = new MockMultipartFile(
                "file", 
                "document.txt", 
                "text/plain", 
                "test content".getBytes()
        );
        
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));

        assertThatThrownBy(() -> albumService.uploadCovers(1L, List.of(textFile)))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("File must be an image");
    }

    @Test
    @DisplayName("Should throw InvalidFileException when file has null content type")
    void shouldThrowExceptionWhenFileHasNullContentType() {
        MockMultipartFile fileWithNullContentType = new MockMultipartFile(
                "file", 
                "file.jpg", 
                null, 
                "test content".getBytes()
        );
        
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));

        assertThatThrownBy(() -> albumService.uploadCovers(1L, List.of(fileWithNullContentType)))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("File must be an image");
    }

    @Test
    @DisplayName("Should throw InvalidFileException when file size exceeds 10MB")
    void shouldThrowExceptionWhenFileSizeExceeds10MB() {
        // Create a file larger than 10MB
        byte[] largeContent = new byte[11 * 1024 * 1024]; // 11MB
        
        MockMultipartFile largeFile = new MockMultipartFile(
                "file", 
                "large.jpg", 
                "image/jpeg", 
                largeContent
        );
        
        when(albumRepository.findById(1L)).thenReturn(Optional.of(testAlbum));

        assertThatThrownBy(() -> albumService.uploadCovers(1L, List.of(largeFile)))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("File size must not exceed 10MB");
    }
}
