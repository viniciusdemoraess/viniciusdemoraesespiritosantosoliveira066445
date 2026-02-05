package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.ArtistRequest;
import br.gov.seplag.artistalbum.application.io.ArtistResponse;
import br.gov.seplag.artistalbum.domain.entity.Artist;
import br.gov.seplag.artistalbum.domain.exception.DuplicateResourceException;
import br.gov.seplag.artistalbum.domain.exception.ResourceNotFoundException;
import br.gov.seplag.artistalbum.domain.repository.ArtistRepository;
import br.gov.seplag.artistalbum.domain.specification.ArtistSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArtistService {

    private final ArtistRepository artistRepository;

    @Transactional(readOnly = true)
    public Page<ArtistResponse> getAllArtists(String name, Pageable pageable) {
        log.debug("Fetching artists with search term: {}, page: {}", name, pageable.getPageNumber());
        
        Specification<Artist> spec = Specification.where(null);
        
        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and(ArtistSpecification.searchByTerm(name));
        }

        Page<Artist> artists = artistRepository.findAll(spec, pageable);
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
        log.info("Creating artist: {}", request.name());

        if (artistRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Artista", "nome", request.name());
        }

        Artist artist = Artist.builder()
                .name(request.name())
                .artistType(request.artistType())
                .country(request.country())
                .biography(request.biography())
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

        if (artistRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new DuplicateResourceException("Artista", "nome", request.name());
        }

        artist.setName(request.name());
        artist.setArtistType(request.artistType());
        artist.setCountry(request.country());
        artist.setBiography(request.biography());
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
