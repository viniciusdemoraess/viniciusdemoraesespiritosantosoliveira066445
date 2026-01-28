package br.gov.seplag.artistalbum.domain.repository;

import br.gov.seplag.artistalbum.domain.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {

    @Query("SELECT DISTINCT a FROM Album a JOIN a.artists ar WHERE ar.id = :artistId")
    Page<Album> findByArtistId(@Param("artistId") Long artistId, Pageable pageable);

    @Query("SELECT DISTINCT a FROM Album a JOIN a.artists ar WHERE ar.id = :artistId AND LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Album> findByArtistIdAndTitleContainingIgnoreCase(
            @Param("artistId") Long artistId,
            @Param("title") String title,
            Pageable pageable
    );

    @Query("SELECT a FROM Album a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Album> findByTitleContainingIgnoreCase(@Param("title") String title, Pageable pageable);

    @Query("SELECT DISTINCT a FROM Album a JOIN a.artists ar WHERE ar.id = :artistId")
    List<Album> findByArtistId(@Param("artistId") Long artistId);

    @Query("SELECT COUNT(a) > 0 FROM Album a JOIN a.artists ar WHERE LOWER(a.title) = LOWER(:title) AND ar.id = :artistId AND a.id != :id")
    boolean existsByTitleAndArtistIdAndIdNot(@Param("title") String title, @Param("artistId") Long artistId, @Param("id") Long id);

    @Query("SELECT COUNT(a) > 0 FROM Album a JOIN a.artists ar WHERE LOWER(a.title) = LOWER(:title) AND ar.id = :artistId")
    boolean existsByTitleAndArtistId(@Param("title") String title, @Param("artistId") Long artistId);
}
