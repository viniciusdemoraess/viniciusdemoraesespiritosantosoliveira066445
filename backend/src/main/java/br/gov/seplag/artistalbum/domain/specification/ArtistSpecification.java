package br.gov.seplag.artistalbum.domain.specification;

import br.gov.seplag.artistalbum.domain.entity.Artist;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;


public class ArtistSpecification {


    public static Specification<Artist> searchByTerm(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("name")), likePattern
            ));

            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("artistType")), likePattern
            ));

            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("country")), likePattern
            ));

            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("biography")), likePattern
            ));

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Artist> nameContains(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("name")),
                "%" + name.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Artist> countryEquals(String country) {
        return (root, query, criteriaBuilder) -> {
            if (country == null || country.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("country")),
                country.toLowerCase()
            );
        };
    }

    public static Specification<Artist> artistTypeEquals(String artistType) {
        return (root, query, criteriaBuilder) -> {
            if (artistType == null || artistType.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("artistType")),
                artistType.toLowerCase()
            );
        };
    }

    public static Specification<Artist> withoutAlbums() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.isEmpty(root.get("albums"));
    }

    public static Specification<Artist> withMinimumAlbums(int minAlbums) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.greaterThanOrEqualTo(
                criteriaBuilder.size(root.get("albums")),
                minAlbums
            );
    }
}
