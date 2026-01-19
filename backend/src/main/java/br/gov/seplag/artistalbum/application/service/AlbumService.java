package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.dto.AlbumCoverResponse;
import br.gov.seplag.artistalbum.application.dto.AlbumRequest;
import br.gov.seplag.artistalbum.application.dto.AlbumResponse;
import br.gov.seplag.artistalbum.domain.entity.Album;
import br.gov.seplag.artistalbum.domain.entity.AlbumCover;
import br.gov.seplag.artistalbum.domain.entity.Artist;
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
                .orElseThrow(() -> new RuntimeException("Album not found with ID: " + id));
        return toResponse(album);
    }

    @Transactional
    public AlbumResponse createAlbum(AlbumRequest request) {
        log.info("Creating album: {}", request.getTitle());

        Artist artist = artistRepository.findById(request.getArtistId())
                .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + request.getArtistId()));

        if (albumRepository.existsByTitleAndArtistId(request.getTitle(), request.getArtistId())) {
            throw new RuntimeException("Album '" + request.getTitle() + "' already exists for this artist");
        }

        Album album = Album.builder()
                .title(request.getTitle())
                .releaseYear(request.getReleaseYear())
                .artist(artist)
                .build();

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
                .orElseThrow(() -> new RuntimeException("Album not found with ID: " + id));

        Artist artist = artistRepository.findById(request.getArtistId())
                .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + request.getArtistId()));

        if (albumRepository.existsByTitleAndArtistIdAndIdNot(request.getTitle(), request.getArtistId(), id)) {
            throw new RuntimeException("Album '" + request.getTitle() + "' already exists for this artist");
        }

        album.setTitle(request.getTitle());
        album.setReleaseYear(request.getReleaseYear());
        album.setArtist(artist);

        Album updatedAlbum = albumRepository.save(album);
        log.info("Album updated successfully: {}", id);

        return toResponse(updatedAlbum);
    }

    @Transactional
    public void deleteAlbum(Long id) {
        log.info("Deleting album ID: {}", id);

        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Album not found with ID: " + id));

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
                .orElseThrow(() -> new RuntimeException("Album not found with ID: " + albumId));

        for (MultipartFile file : files) {
            validateImageFile(file);
            
            String objectKey = minioStorageService.uploadFile(file, "album-covers");
            
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
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("File must be an image");
        }

        // Max 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size must not exceed 10MB");
        }
    }

    private AlbumResponse toResponse(Album album) {
        List<AlbumCoverResponse> coverResponses = album.getCovers() != null
                ? album.getCovers().stream()
                .map(this::toCoverResponse)
                .collect(Collectors.toList())
                : new ArrayList<>();

        return AlbumResponse.builder()
                .id(album.getId())
                .title(album.getTitle())
                .releaseYear(album.getReleaseYear())
                .artistId(album.getArtist().getId())
                .artistName(album.getArtist().getName())
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
