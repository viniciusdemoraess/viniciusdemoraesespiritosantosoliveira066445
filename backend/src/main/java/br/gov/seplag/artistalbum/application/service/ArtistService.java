package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.ArtistRequest;
import br.gov.seplag.artistalbum.application.io.ArtistResponse;
import br.gov.seplag.artistalbum.domain.entity.Artist;
import br.gov.seplag.artistalbum.domain.exception.DuplicateResourceException;
import br.gov.seplag.artistalbum.domain.exception.ResourceNotFoundException;
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
                .orElseThrow(() -> new ResourceNotFoundException("Artist", "id", id));
        return toResponse(artist);
    }

    @Transactional
    public ArtistResponse createArtist(ArtistRequest request) {
        log.info("Creating artist: {}", request.getName());

        if (artistRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Artist", "name", request.getName());
        }

        Artist artist = Artist.builder()
                .name(request.getName())
                .artistType(request.getArtistType())
                .country(request.getCountry())
                .biography(request.getBiography())
                .build();

        Artist savedArtist = artistRepository.save(artist);
        log.info("Artist created successfully with ID: {}", savedArtist.getId());

        return toResponse(savedArtist);
    }

    @Transactional
    public ArtistResponse updateArtist(Long id, ArtistRequest request) {
        log.info("Updating artist ID: {}", id);

        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist", "id", id));

        if (artistRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Artist", "name", request.getName());
        }

        artist.setName(request.getName());
        artist.setArtistType(request.getArtistType());
        artist.setCountry(request.getCountry());
        artist.setBiography(request.getBiography());
        Artist updatedArtist = artistRepository.save(artist);

        log.info("Artist updated successfully: {}", id);
        return toResponse(updatedArtist);
    }

    @Transactional
    public void deleteArtist(Long id) {
        log.info("Deleting artist ID: {}", id);

        if (!artistRepository.existsById(id)) {
            throw new ResourceNotFoundException("Artist", "id", id);
        }

        artistRepository.deleteById(id);
        log.info("Artist deleted successfully: {}", id);
    }

    private ArtistResponse toResponse(Artist artist) {
        return ArtistResponse.builder()
                .id(artist.getId())
                .name(artist.getName())
                .artistType(artist.getArtistType())
                .country(artist.getCountry())
                .biography(artist.getBiography())
                .albumCount(artist.getAlbumCount())
                .createdAt(artist.getCreatedAt())
                .updatedAt(artist.getUpdatedAt())
                .build();
    }
}
