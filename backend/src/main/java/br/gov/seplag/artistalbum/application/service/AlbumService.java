package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.AlbumCoverResponse;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Album Service
 * Business logic for album management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final AlbumCoverRepository albumCoverRepository;
    private final MinioStorageService minioStorageService;
    private final WebSocketNotificationService webSocketNotificationService;

    @Transactional(readOnly = true)
    public Page<AlbumResponse> getAllAlbums(Long artistId, String title, Pageable pageable) {
        log.debug("Fetching albums - artistId: {}, title: {}, page: {}", artistId, title, pageable.getPageNumber());

        Page<Album> albums;
        if (artistId != null && title != null && !title.trim().isEmpty()) {
            albums = albumRepository.findByArtistIdAndTitleContainingIgnoreCase(artistId, title, pageable);
        } else if (artistId != null) {
            albums = albumRepository.findByArtistId(artistId, pageable);
        } else if (title != null && !title.trim().isEmpty()) {
            albums = albumRepository.findByTitleContainingIgnoreCase(title, pageable);
        } else {
            albums = albumRepository.findAll(pageable);
        }

        return albums.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AlbumResponse getAlbumById(Long id) {
        log.debug("Fetching album by ID: {}", id);
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", id));
        return toResponse(album);
    }

    @Transactional
    public AlbumResponse createAlbum(AlbumRequest request) {
        log.info("Creating album: {}", request.getTitle());

        // Suporta tanto artistId (legacy) quanto artistIds (novo)
        List<Long> artistIds = new ArrayList<>();
        if (request.getArtistIds() != null && !request.getArtistIds().isEmpty()) {
            artistIds.addAll(request.getArtistIds());
        } else if (request.getArtistId() != null) {
            artistIds.add(request.getArtistId());
        }

        if (artistIds.isEmpty()) {
            throw new IllegalArgumentException("At least one artist must be provided");
        }

        // Buscar todos os artistas
        List<Artist> artists = new ArrayList<>();
        for (Long artistId : artistIds) {
            Artist artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new ResourceNotFoundException("Artist", "id", artistId));
            artists.add(artist);
        }

        // Verificar duplicação (mantendo compatibilidade com código antigo)
        if (request.getArtistId() != null && 
            albumRepository.existsByTitleAndArtistId(request.getTitle(), request.getArtistId())) {
            throw new DuplicateResourceException("Album", "title", request.getTitle());
        }

        Album album = Album.builder()
                .title(request.getTitle())
                .releaseYear(request.getReleaseYear())
                .genre(request.getGenre())
                .recordLabel(request.getRecordLabel())
                .totalTracks(request.getTotalTracks())
                .totalDurationSeconds(request.getTotalDurationSeconds())
                .build();

        // Adicionar todos os artistas
        for (Artist artist : artists) {
            album.addArtist(artist);
        }

        Album savedAlbum = albumRepository.save(album);
        log.info("Album created successfully with ID: {}", savedAlbum.getId());

        // Send WebSocket notification
        webSocketNotificationService.notifyNewAlbum(savedAlbum);

        return toResponse(savedAlbum);
    }

    @Transactional
    public AlbumResponse updateAlbum(Long id, AlbumRequest request) {
        log.info("Updating album ID: {}", id);

        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", id));

        // Suporta tanto artistId (legacy) quanto artistIds (novo)
        List<Long> artistIds = new ArrayList<>();
        if (request.getArtistIds() != null && !request.getArtistIds().isEmpty()) {
            artistIds.addAll(request.getArtistIds());
        } else if (request.getArtistId() != null) {
            artistIds.add(request.getArtistId());
        }

        // Atualizar campos básicos
        album.setTitle(request.getTitle());
        album.setReleaseYear(request.getReleaseYear());
        album.setGenre(request.getGenre());
        album.setRecordLabel(request.getRecordLabel());
        album.setTotalTracks(request.getTotalTracks());
        album.setTotalDurationSeconds(request.getTotalDurationSeconds());

        // Atualizar artistas se fornecidos
        if (!artistIds.isEmpty()) {
            // Remover artistas antigos
            new ArrayList<>(album.getArtists()).forEach(album::removeArtist);

            // Adicionar novos artistas
            for (Long artistId : artistIds) {
                Artist artist = artistRepository.findById(artistId)
                        .orElseThrow(() -> new ResourceNotFoundException("Artist", "id", artistId));
                album.addArtist(artist);
            }
        }

        Album updatedAlbum = albumRepository.save(album);
        log.info("Album updated successfully: {}", id);

        return toResponse(updatedAlbum);
    }

    @Transactional
    public void deleteAlbum(Long id) {
        log.info("Deleting album ID: {}", id);

        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", id));

        // Delete covers from MinIO
        album.getCovers().forEach(cover -> {
            try {
                minioStorageService.deleteFile(cover.getObjectKey());
            } catch (Exception e) {
                log.error("Error deleting cover from MinIO: {}", cover.getObjectKey(), e);
            }
        });

        albumRepository.deleteById(id);
        log.info("Album deleted successfully: {}", id);
    }

    @Transactional
    public AlbumResponse uploadCovers(Long albumId, List<MultipartFile> files) {
        log.info("Uploading {} covers for album ID: {}", files.size(), albumId);

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", albumId));

        for (MultipartFile file : files) {
            validateImageFile(file);
            
            String objectKey = minioStorageService.uploadFile(file, "covers");
            
            AlbumCover cover = AlbumCover.builder()
                    .fileName(file.getOriginalFilename())
                    .objectKey(objectKey)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .album(album)
                    .build();

            album.addCover(cover);
        }

        Album savedAlbum = albumRepository.save(album);
        log.info("Covers uploaded successfully for album: {}", albumId);

        return toResponse(savedAlbum);
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidFileException("File must be an image");
        }

        // Max 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new InvalidFileException("File size must not exceed 10MB");
        }
    }

    private AlbumResponse toResponse(Album album) {
        List<AlbumCoverResponse> coverResponses = album.getCovers() != null
                ? album.getCovers().stream()
                .map(this::toCoverResponse)
                .collect(Collectors.toList())
                : new ArrayList<>();

        List<br.gov.seplag.artistalbum.application.io.ArtistSummary> artistSummaries = album.getArtists() != null
                ? album.getArtists().stream()
                .map(artist -> br.gov.seplag.artistalbum.application.io.ArtistSummary.builder()
                        .id(artist.getId())
                        .name(artist.getName())
                        .artistType(artist.getArtistType())
                        .country(artist.getCountry())
                        .build())
                .collect(Collectors.toList())
                : new ArrayList<>();

        // Compatibilidade com código antigo - pegar primeiro artista se existir
        Long firstArtistId = !album.getArtists().isEmpty() ? album.getArtists().get(0).getId() : null;
        String firstArtistName = !album.getArtists().isEmpty() ? album.getArtists().get(0).getName() : null;

        return AlbumResponse.builder()
                .id(album.getId())
                .title(album.getTitle())
                .releaseYear(album.getReleaseYear())
                .genre(album.getGenre())
                .recordLabel(album.getRecordLabel())
                .totalTracks(album.getTotalTracks())
                .totalDurationSeconds(album.getTotalDurationSeconds())
                .artistId(firstArtistId)
                .artistName(firstArtistName)
                .artists(artistSummaries)
                .covers(coverResponses)
                .createdAt(album.getCreatedAt())
                .updatedAt(album.getUpdatedAt())
                .build();
    }

    private AlbumCoverResponse toCoverResponse(AlbumCover cover) {
        return AlbumCoverResponse.builder()
                .id(cover.getId())
                .fileName(cover.getFileName())
                .contentType(cover.getContentType())
                .fileSize(cover.getFileSize())
                .url(minioStorageService.getPresignedUrl(cover.getObjectKey()))
                .createdAt(cover.getCreatedAt())
                .build();
    }
}
