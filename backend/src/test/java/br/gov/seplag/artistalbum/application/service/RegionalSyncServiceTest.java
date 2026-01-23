package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.RegionalDTO;
import br.gov.seplag.artistalbum.domain.entity.Regional;
import br.gov.seplag.artistalbum.domain.exception.SynchronizationException;
import br.gov.seplag.artistalbum.domain.repository.RegionalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RegionalSyncService Tests")
class RegionalSyncServiceTest {

    @Mock
    private RegionalRepository regionalRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private RegionalSyncService regionalSyncService;

    private final String externalApiUrl = "http://example.com/api/regionais";

    @BeforeEach
    void setUp() {
        // Set the external API URL using reflection
        ReflectionTestUtils.setField(regionalSyncService, "externalApiUrl", externalApiUrl);
        ReflectionTestUtils.setField(regionalSyncService, "restTemplate", restTemplate);
    }

    @Test
    @DisplayName("Should insert new regional from external API")
    void shouldInsertNewRegionalFromExternalAPI() {
        // Arrange
        RegionalDTO[] externalRegionais = {
                createRegionalDTO(1, "Regional Norte"),
                createRegionalDTO(2, "Regional Sul")
        };

        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(externalRegionais);
        when(regionalRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        regionalSyncService.synchronize();

        // Assert
        verify(regionalRepository, times(2)).save(any(Regional.class));
        verify(regionalRepository).save(argThat(regional ->
                regional.getExternalId().equals(1) &&
                        regional.getNome().equals("Regional Norte") &&
                        regional.getAtivo()
        ));
        verify(regionalRepository).save(argThat(regional ->
                regional.getExternalId().equals(2) &&
                        regional.getNome().equals("Regional Sul") &&
                        regional.getAtivo()
        ));
    }

    @Test
    @DisplayName("Should inactivate regional removed from external API")
    void shouldInactivateRegionalRemovedFromExternalAPI() {
        // Arrange
        RegionalDTO[] externalRegionais = {
                createRegionalDTO(1, "Regional Norte")
        };

        Regional localRegional1 = createLocalRegional(1L, 1, "Regional Norte", true);
        Regional localRegional2 = createLocalRegional(2L, 2, "Regional Sul", true);

        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(externalRegionais);
        when(regionalRepository.findAll()).thenReturn(Arrays.asList(localRegional1, localRegional2));

        // Act
        regionalSyncService.synchronize();

        // Assert
        assertThat(localRegional2.getAtivo()).isFalse();
        verify(regionalRepository).save(localRegional2);
    }

    @Test
    @DisplayName("Should update regional when name changes")
    void shouldUpdateRegionalWhenNameChanges() {
        // Arrange
        RegionalDTO[] externalRegionais = {
                createRegionalDTO(1, "Regional Norte Atualizado")
        };

        Regional localRegional = createLocalRegional(1L, 1, "Regional Norte", true);

        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(externalRegionais);
        when(regionalRepository.findAll()).thenReturn(Arrays.asList(localRegional));

        // Act
        regionalSyncService.synchronize();

        // Assert
        assertThat(localRegional.getAtivo()).isFalse();
        verify(regionalRepository, times(2)).save(any(Regional.class));
        verify(regionalRepository).save(localRegional); // inactivate old
        verify(regionalRepository).save(argThat(regional ->
                regional.getExternalId().equals(1) &&
                        regional.getNome().equals("Regional Norte Atualizado") &&
                        regional.getAtivo()
        )); // create new
    }

    @Test
    @DisplayName("Should reactivate inactive regional")
    void shouldReactivateInactiveRegional() {
        // Arrange
        RegionalDTO[] externalRegionais = {
                createRegionalDTO(1, "Regional Norte")
        };

        Regional localRegional = createLocalRegional(1L, 1, "Regional Norte", false);

        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(externalRegionais);
        when(regionalRepository.findAll()).thenReturn(Arrays.asList(localRegional));

        // Act
        regionalSyncService.synchronize();

        // Assert
        assertThat(localRegional.getAtivo()).isTrue();
        verify(regionalRepository).save(localRegional);
    }

    @Test
    @DisplayName("Should handle empty response from external API")
    void shouldHandleEmptyResponseFromExternalAPI() {
        // Arrange
        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(new RegionalDTO[0]);

        // Act
        regionalSyncService.synchronize();

        // Assert
        verify(regionalRepository, never()).save(any(Regional.class));
        verify(regionalRepository, never()).findAll();
    }

    @Test
    @DisplayName("Should handle null response from external API")
    void shouldHandleNullResponseFromExternalAPI() {
        // Arrange
        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(null);

        // Act
        regionalSyncService.synchronize();

        // Assert
        verify(regionalRepository, never()).save(any(Regional.class));
        verify(regionalRepository, never()).findAll();
    }

    @Test
    @DisplayName("Should throw SynchronizationException when external API fails")
    void shouldThrowSynchronizationExceptionWhenExternalAPIFails() {
        // Arrange
        when(restTemplate.getForObject(anyString(), eq(RegionalDTO[].class)))
                .thenThrow(new RestClientException("Connection failed"));

        // Act & Assert
        assertThatThrownBy(() -> regionalSyncService.synchronize())
                .isInstanceOf(SynchronizationException.class)
                .hasMessageContaining("regionais");
    }

    @Test
    @DisplayName("Should get all active regionais")
    void shouldGetAllActiveRegionais() {
        // Arrange
        List<Regional> activeRegionais = Arrays.asList(
                createLocalRegional(1L, 1, "Regional Norte", true),
                createLocalRegional(2L, 2, "Regional Sul", true)
        );

        when(regionalRepository.findByAtivoTrue()).thenReturn(activeRegionais);

        // Act
        List<Regional> result = regionalSyncService.getAllActiveRegionais();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(Regional::getAtivo);
        verify(regionalRepository).findByAtivoTrue();
    }

    @Test
    @DisplayName("Should get all regionais ordered by name")
    void shouldGetAllRegionaisOrderedByName() {
        // Arrange
        List<Regional> allRegionais = Arrays.asList(
                createLocalRegional(1L, 1, "Regional A", true),
                createLocalRegional(2L, 2, "Regional B", false),
                createLocalRegional(3L, 3, "Regional C", true)
        );

        when(regionalRepository.findAllByOrderByNomeAsc()).thenReturn(allRegionais);

        // Act
        List<Regional> result = regionalSyncService.getAllRegionais();

        // Assert
        assertThat(result).hasSize(3);
        verify(regionalRepository).findAllByOrderByNomeAsc();
    }

    @Test
    @DisplayName("Should call synchronize in scheduled sync")
    void shouldCallSynchronizeInScheduledSync() {
        // Arrange
        RegionalDTO[] externalRegionais = {
                createRegionalDTO(1, "Regional Norte")
        };

        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(externalRegionais);
        when(regionalRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        regionalSyncService.scheduledSync();

        // Assert
        verify(restTemplate).getForObject(eq(externalApiUrl), eq(RegionalDTO[].class));
        verify(regionalRepository).save(any(Regional.class));
    }

    @Test
    @DisplayName("Should ignore regional with null external ID when inactivating")
    void shouldIgnoreRegionalWithNullExternalIdWhenInactivating() {
        // Arrange
        RegionalDTO[] externalRegionais = {
                createRegionalDTO(1, "Regional Norte")
        };

        Regional localRegional1 = createLocalRegional(1L, 1, "Regional Norte", true);
        Regional localRegional2 = Regional.builder()
                .id(2L)
                .externalId(null) // No external ID
                .nome("Regional Legado")
                .ativo(true)
                .build();

        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(externalRegionais);
        when(regionalRepository.findAll()).thenReturn(Arrays.asList(localRegional1, localRegional2));

        // Act
        regionalSyncService.synchronize();

        // Assert
        assertThat(localRegional2.getAtivo()).isTrue(); // Should remain active
        verify(regionalRepository, never()).save(localRegional2);
    }

    @Test
    @DisplayName("Should not inactivate already inactive regional")
    void shouldNotInactivateAlreadyInactiveRegional() {
        // Arrange
        RegionalDTO[] externalRegionais = {
                createRegionalDTO(1, "Regional Norte")
        };

        Regional localRegional1 = createLocalRegional(1L, 1, "Regional Norte", true);
        Regional localRegional2 = createLocalRegional(2L, 2, "Regional Sul", false); // Already inactive

        when(restTemplate.getForObject(eq(externalApiUrl), eq(RegionalDTO[].class)))
                .thenReturn(externalRegionais);
        when(regionalRepository.findAll()).thenReturn(Arrays.asList(localRegional1, localRegional2));

        // Act
        regionalSyncService.synchronize();

        // Assert
        assertThat(localRegional2.getAtivo()).isFalse();
        verify(regionalRepository, never()).save(localRegional2); // Should not save already inactive
    }

    // Helper methods
    private RegionalDTO createRegionalDTO(Integer id, String nome) {
        RegionalDTO dto = new RegionalDTO();
        dto.setId(id);
        dto.setNome(nome);
        return dto;
    }

    private Regional createLocalRegional(Long id, Integer externalId, String nome, Boolean ativo) {
        return Regional.builder()
                .id(id)
                .externalId(externalId)
                .nome(nome)
                .ativo(ativo)
                .build();
    }
}
