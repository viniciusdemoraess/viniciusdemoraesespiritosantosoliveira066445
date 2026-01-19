package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.dto.ArtistRequest;
import br.gov.seplag.artistalbum.application.dto.ArtistResponse;
import br.gov.seplag.artistalbum.domain.entity.Artist;
import br.gov.seplag.artistalbum.domain.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Artist Service
 * Business logic for artist management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ArtistService {

    private final ArtistRepository artistRepository;

    @Transactional(readOnly = true)
    public Page<ArtistResponse> getAllArtists(String name, Pageable pageable) {
        log.debug("Fetching artists with name filter: {}, page: {}", name, pageable.getPageNumber());
        
        Page<Artist> artists;
        if (name != null && !name.trim().isEmpty()) {
            artists = artistRepository.findByNameContainingIgnoreCase(name, pageable);
        } else {
            artists = artistRepository.findAll(pageable);
        }

        return artists.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ArtistResponse getArtistById(Long id) {
        log.debug("Fetching artist by ID: {}", id);
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + id));
        return toResponse(artist);
    }

    @Transactional
    public ArtistResponse createArtist(ArtistRequest request) {
        log.info("Creating artist: {}", request.getName());

        if (artistRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Artist with name '" + request.getName() + "' already exists");
        }

        Artist artist = Artist.builder()
                .name(request.getName())
                .build();

        Artist savedArtist = artistRepository.save(artist);
        log.info("Artist created successfully with ID: {}", savedArtist.getId());

        return toResponse(savedArtist);
    }

    @Transactional
    public ArtistResponse updateArtist(Long id, ArtistRequest request) {
        log.info("Updating artist ID: {}", id);

        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + id));

        if (artistRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Artist with name '" + request.getName() + "' already exists");
        }

        artist.setName(request.getName());
        Artist updatedArtist = artistRepository.save(artist);

        log.info("Artist updated successfully: {}", id);
        return toResponse(updatedArtist);
    }

    @Transactional
    public void deleteArtist(Long id) {
        log.info("Deleting artist ID: {}", id);

        if (!artistRepository.existsById(id)) {
            throw new RuntimeException("Artist not found with ID: " + id);
        }

        artistRepository.deleteById(id);
        log.info("Artist deleted successfully: {}", id);
    }

    private ArtistResponse toResponse(Artist artist) {
        return ArtistResponse.builder()
                .id(artist.getId())
                .name(artist.getName())
                .albumCount(artist.getAlbumCount())
                .createdAt(artist.getCreatedAt())
                .updatedAt(artist.getUpdatedAt())
                .build();
    }
}
