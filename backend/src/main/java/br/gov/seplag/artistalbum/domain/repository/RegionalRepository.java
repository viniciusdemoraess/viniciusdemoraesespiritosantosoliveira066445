package br.gov.seplag.artistalbum.domain.repository;

import br.gov.seplag.artistalbum.domain.entity.Regional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegionalRepository extends JpaRepository<Regional, Long> {

    Optional<Regional> findByExternalId(Integer externalId);

    List<Regional> findByAtivoTrue();

    List<Regional> findAllByOrderByNomeAsc();
}
