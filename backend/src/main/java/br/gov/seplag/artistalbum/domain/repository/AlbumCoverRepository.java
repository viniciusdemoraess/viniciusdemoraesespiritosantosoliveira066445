package br.gov.seplag.artistalbum.domain.repository;

import br.gov.seplag.artistalbum.domain.entity.AlbumCover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumCoverRepository extends JpaRepository<AlbumCover, Long> {

    List<AlbumCover> findByAlbumId(Long albumId);

    Optional<AlbumCover> findByObjectKey(String objectKey);

    void deleteByAlbumId(Long albumId);
}
