package br.gov.seplag.artistalbum.domain.repository;

import br.gov.seplag.artistalbum.domain.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long>, JpaSpecificationExecutor<Artist> {

    Optional<Artist> findByNameIgnoreCase(String name);

    @Query("SELECT COUNT(a) > 0 FROM Artist a WHERE LOWER(a.name) = LOWER(:name) AND a.id != :id")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);

    @Query("SELECT COUNT(a) > 0 FROM Artist a WHERE LOWER(a.name) = LOWER(:name)")
    boolean existsByNameIgnoreCase(@Param("name") String name);

    @Query("SELECT COUNT(a) FROM Artist a WHERE SIZE(a.albums) = 0")
    long countArtistsWithoutAlbums();
}
