package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.domain.entity.Artist;
import br.gov.seplag.artistalbum.domain.repository.ArtistRepository;
import br.gov.seplag.artistalbum.domain.specification.ArtistSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class ArtistSearchService {

    private final ArtistRepository artistRepository;

    public Page<Artist> searchArtists(String searchTerm, Pageable pageable) {
        return artistRepository.findAll(
            ArtistSpecification.searchByTerm(searchTerm),
            pageable
        );
    }

    public Page<Artist> advancedSearch(
        String searchTerm,
        String country,
        String artistType,
        Boolean withoutAlbums,
        Integer minAlbums,
        Pageable pageable
    ) {
        Specification<Artist> spec = Specification.where(null);

        if (searchTerm != null && !searchTerm.isEmpty()) {
            spec = spec.and(ArtistSpecification.searchByTerm(searchTerm));
        }

        if (country != null && !country.isEmpty()) {
            spec = spec.and(ArtistSpecification.countryEquals(country));
        }

        if (artistType != null && !artistType.isEmpty()) {
            spec = spec.and(ArtistSpecification.artistTypeEquals(artistType));
        }

        if (Boolean.TRUE.equals(withoutAlbums)) {
            spec = spec.and(ArtistSpecification.withoutAlbums());
        }

        if (minAlbums != null && minAlbums > 0) {
            spec = spec.and(ArtistSpecification.withMinimumAlbums(minAlbums));
        }

        return artistRepository.findAll(spec, pageable);
    }

    public Page<Artist> searchByName(String name, Pageable pageable) {
        return artistRepository.findAll(
            ArtistSpecification.nameContains(name),
            pageable
        );
    }

    public Page<Artist> findByCountry(String country, Pageable pageable) {
        return artistRepository.findAll(
            ArtistSpecification.countryEquals(country),
            pageable
        );
    }

    public Page<Artist> findArtistsWithoutAlbums(Pageable pageable) {
        return artistRepository.findAll(
            ArtistSpecification.withoutAlbums(),
            pageable
        );
    }

    public Page<Artist> findBrazilianBandsWithMultipleAlbums(Pageable pageable) {
        return artistRepository.findAll(
            Specification.where(ArtistSpecification.countryEquals("Brazil"))
                        .and(ArtistSpecification.artistTypeEquals("Band"))
                        .and(ArtistSpecification.withMinimumAlbums(3)),
            pageable
        );
    }
}
