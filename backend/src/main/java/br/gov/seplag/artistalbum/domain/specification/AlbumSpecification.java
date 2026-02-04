package br.gov.seplag.artistalbum.domain.specification;

import br.gov.seplag.artistalbum.domain.entity.Album;
import br.gov.seplag.artistalbum.domain.entity.Artist;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;


public class AlbumSpecification {

    public static Specification<Album> searchByTerm(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("title")), likePattern
            ));

            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("genre")), likePattern
            ));

            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("recordLabel")), likePattern
            ));

            try {
                Integer year = Integer.parseInt(searchTerm);
                predicates.add(criteriaBuilder.equal(root.get("releaseYear"), year));
            } catch (NumberFormatException e) {
            }

            Join<Album, Artist> artistJoin = root.join("artists");
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(artistJoin.get("name")), likePattern
            ));

            query.distinct(true);

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }


    public static Specification<Album> byArtist(Long artistId) {
        return (root, query, criteriaBuilder) -> {
            if (artistId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Album, Artist> artistJoin = root.join("artists");
            query.distinct(true);
            return criteriaBuilder.equal(artistJoin.get("id"), artistId);
        };
    }


    public static Specification<Album> byArtistAndSearchTerm(Long artistId, String searchTerm) {
        return Specification.where(byArtist(artistId))
                           .and(searchByTerm(searchTerm));
    }

    public static Specification<Album> genreEquals(String genre) {
        return (root, query, criteriaBuilder) -> {
            if (genre == null || genre.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("genre")),
                genre.toLowerCase()
            );
        };
    }


    public static Specification<Album> releasedBetween(Integer startYear, Integer endYear) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (startYear != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("releaseYear"), startYear));
            }
            if (endYear != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("releaseYear"), endYear));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }


    public static Specification<Album> withoutCovers() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.isEmpty(root.get("covers"));
    }

    public static Specification<Album> withCovers() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.isNotEmpty(root.get("covers"));
    }
}
