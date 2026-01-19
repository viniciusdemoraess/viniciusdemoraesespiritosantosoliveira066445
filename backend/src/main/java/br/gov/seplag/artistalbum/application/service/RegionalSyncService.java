package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.dto.RegionalDTO;
import br.gov.seplag.artistalbum.domain.entity.Regional;
import br.gov.seplag.artistalbum.domain.repository.RegionalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Regional Synchronization Service
 * Implements intelligent synchronization with O(n) complexity
 * 
 * Rules:
 * 1. New in external API → Insert locally
 * 2. Removed from external API → Inactivate locally
 * 3. Name changed → Inactivate old, create new
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegionalSyncService {

    private final RegionalRepository regionalRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${external.regionais-api.url}")
    private String externalApiUrl;

    /**
     * Synchronize with external API
     * Algorithm complexity: O(n) where n is the number of regionais
     */
    @Transactional
    public void synchronize() {
        log.info("Starting regional synchronization from: {}", externalApiUrl);

        try {
            // 1. Fetch data from external API
            RegionalDTO[] externalRegionais = restTemplate.getForObject(externalApiUrl, RegionalDTO[].class);
            if (externalRegionais == null || externalRegionais.length == 0) {
                log.warn("No regionais returned from external API");
                return;
            }

            // 2. Build maps for O(1) lookups - O(n)
            Map<Integer, RegionalDTO> externalMap = Arrays.stream(externalRegionais)
                    .collect(Collectors.toMap(RegionalDTO::getId, dto -> dto));

            List<Regional> localRegionais = regionalRepository.findAll();
            Map<Integer, Regional> localMap = localRegionais.stream()
                    .filter(r -> r.getExternalId() != null)
                    .collect(Collectors.toMap(Regional::getExternalId, r -> r));

            int inserted = 0;
            int inactivated = 0;
            int updated = 0;

            // 3. Process external regionais - O(n)
            for (RegionalDTO externalDto : externalRegionais) {
                Regional localRegional = localMap.get(externalDto.getId());

                if (localRegional == null) {
                    // NEW: Insert
                    Regional newRegional = Regional.builder()
                            .externalId(externalDto.getId())
                            .nome(externalDto.getNome())
                            .ativo(true)
                            .build();
                    regionalRepository.save(newRegional);
                    inserted++;
                    log.debug("Inserted new regional: {} - {}", externalDto.getId(), externalDto.getNome());

                } else if (!localRegional.getNome().equals(externalDto.getNome())) {
                    // UPDATED: Inactivate old and create new
                    localRegional.setAtivo(false);
                    regionalRepository.save(localRegional);

                    Regional newRegional = Regional.builder()
                            .externalId(externalDto.getId())
                            .nome(externalDto.getNome())
                            .ativo(true)
                            .build();
                    regionalRepository.save(newRegional);
                    updated++;
                    log.debug("Updated regional: {} - Old: '{}', New: '{}'",
                            externalDto.getId(), localRegional.getNome(), externalDto.getNome());

                } else if (!localRegional.getAtivo()) {
                    // Reactivate if it was inactive
                    localRegional.setAtivo(true);
                    regionalRepository.save(localRegional);
                    log.debug("Reactivated regional: {} - {}", externalDto.getId(), externalDto.getNome());
                }
            }

            // 4. Inactivate removed regionais - O(n)
            Set<Integer> externalIds = externalMap.keySet();
            for (Regional local : localRegionais) {
                if (local.getExternalId() != null && 
                    !externalIds.contains(local.getExternalId()) && 
                    local.getAtivo()) {
                    local.setAtivo(false);
                    regionalRepository.save(local);
                    inactivated++;
                    log.debug("Inactivated regional: {} - {}", local.getExternalId(), local.getNome());
                }
            }

            log.info("Regional synchronization completed - Inserted: {}, Updated: {}, Inactivated: {}",
                    inserted, updated, inactivated);

        } catch (Exception e) {
            log.error("Error during regional synchronization", e);
            throw new RuntimeException("Failed to synchronize regionais", e);
        }
    }

    /**
     * Auto-sync every hour (can be configured)
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void scheduledSync() {
        log.info("Executing scheduled regional synchronization");
        synchronize();
    }

    @Transactional(readOnly = true)
    public List<Regional> getAllActiveRegionais() {
        return regionalRepository.findByAtivoTrue();
    }

    @Transactional(readOnly = true)
    public List<Regional> getAllRegionais() {
        return regionalRepository.findAllByOrderByNomeAsc();
    }
}
