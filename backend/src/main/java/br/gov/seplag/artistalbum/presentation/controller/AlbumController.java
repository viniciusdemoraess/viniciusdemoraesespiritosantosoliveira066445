package br.gov.seplag.artistalbum.presentation.controller;

import br.gov.seplag.artistalbum.application.dto.AlbumRequest;
import br.gov.seplag.artistalbum.application.dto.AlbumResponse;
import br.gov.seplag.artistalbum.application.service.AlbumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/albums")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Albums", description = "Album management endpoints")
public class AlbumController {

    private final AlbumService albumService;

    @GetMapping
    @Operation(summary = "Get all albums", description = "Get paginated list of albums with optional filtering")
    public ResponseEntity<Page<AlbumResponse>> getAllAlbums(
            @RequestParam(required = false) Long artistId,
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<AlbumResponse> albums = albumService.getAllAlbums(artistId, title, pageable);
        return ResponseEntity.ok(albums);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get album by ID", description = "Get detailed information about an album including covers")
    public ResponseEntity<AlbumResponse> getAlbumById(@PathVariable Long id) {
        AlbumResponse album = albumService.getAlbumById(id);
        return ResponseEntity.ok(album);
    }

    @PostMapping
    @Operation(summary = "Create album", description = "Create a new album")
    public ResponseEntity<AlbumResponse> createAlbum(@Valid @RequestBody AlbumRequest request) {
        AlbumResponse album = albumService.createAlbum(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(album);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update album", description = "Update an existing album")
    public ResponseEntity<AlbumResponse> updateAlbum(
            @PathVariable Long id,
            @Valid @RequestBody AlbumRequest request
    ) {
        AlbumResponse album = albumService.updateAlbum(id, request);
        return ResponseEntity.ok(album);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete album", description = "Delete an album and all associated covers")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        albumService.deleteAlbum(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/covers")
    @Operation(summary = "Upload album covers", description = "Upload one or more cover images for an album (max 10MB per file)")
    public ResponseEntity<AlbumResponse> uploadCovers(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files
    ) {
        AlbumResponse album = albumService.uploadCovers(id, files);
        return ResponseEntity.ok(album);
    }
}
