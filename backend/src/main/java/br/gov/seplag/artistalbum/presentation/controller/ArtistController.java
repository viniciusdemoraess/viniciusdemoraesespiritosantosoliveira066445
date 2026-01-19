package br.gov.seplag.artistalbum.presentation.controller;

import br.gov.seplag.artistalbum.application.dto.ArtistRequest;
import br.gov.seplag.artistalbum.application.dto.ArtistResponse;
import br.gov.seplag.artistalbum.application.service.ArtistService;
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

@RestController
@RequestMapping("/api/v1/artists")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Artists", description = "Artist management endpoints")
public class ArtistController {

    private final ArtistService artistService;

    @GetMapping
    @Operation(summary = "Get all artists", description = "Get paginated list of artists with optional filtering and sorting")
    public ResponseEntity<Page<ArtistResponse>> getAllArtists(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<ArtistResponse> artists = artistService.getAllArtists(name, pageable);
        return ResponseEntity.ok(artists);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get artist by ID", description = "Get detailed information about an artist")
    public ResponseEntity<ArtistResponse> getArtistById(@PathVariable Long id) {
        ArtistResponse artist = artistService.getArtistById(id);
        return ResponseEntity.ok(artist);
    }

    @PostMapping
    @Operation(summary = "Create artist", description = "Create a new artist")
    public ResponseEntity<ArtistResponse> createArtist(@Valid @RequestBody ArtistRequest request) {
        ArtistResponse artist = artistService.createArtist(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(artist);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update artist", description = "Update an existing artist")
    public ResponseEntity<ArtistResponse> updateArtist(
            @PathVariable Long id,
            @Valid @RequestBody ArtistRequest request
    ) {
        ArtistResponse artist = artistService.updateArtist(id, request);
        return ResponseEntity.ok(artist);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete artist", description = "Delete an artist and all associated albums")
    public ResponseEntity<Void> deleteArtist(@PathVariable Long id) {
        artistService.deleteArtist(id);
        return ResponseEntity.noContent().build();
    }
}
