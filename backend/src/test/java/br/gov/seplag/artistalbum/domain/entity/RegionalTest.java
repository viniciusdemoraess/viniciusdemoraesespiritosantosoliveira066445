package br.gov.seplag.artistalbum.domain.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Regional Entity Tests")
class RegionalTest {

    @Test
    @DisplayName("Should create regional with builder")
    void shouldCreateRegionalWithBuilder() {
        Regional regional = Regional.builder()
                .id(1L)
                .externalId(100)
                .nome("Regional Centro")
                .ativo(true)
                .build();

        assertThat(regional).isNotNull();
        assertThat(regional.getId()).isEqualTo(1L);
        assertThat(regional.getExternalId()).isEqualTo(100);
        assertThat(regional.getNome()).isEqualTo("Regional Centro");
        assertThat(regional.getAtivo()).isTrue();
    }

    @Test
    @DisplayName("Should create regional with no-args constructor")
    void shouldCreateRegionalWithNoArgsConstructor() {
        Regional regional = new Regional();
        
        assertThat(regional).isNotNull();
        assertThat(regional.getId()).isNull();
        assertThat(regional.getNome()).isNull();
    }

    @Test
    @DisplayName("Should create regional with all-args constructor")
    void shouldCreateRegionalWithAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        
        Regional regional = new Regional(
                1L,
                100,
                "Regional Norte",
                true,
                now,
                now
        );

        assertThat(regional.getId()).isEqualTo(1L);
        assertThat(regional.getExternalId()).isEqualTo(100);
        assertThat(regional.getNome()).isEqualTo("Regional Norte");
        assertThat(regional.getAtivo()).isTrue();
        assertThat(regional.getCreatedAt()).isEqualTo(now);
        assertThat(regional.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should set and get all properties")
    void shouldSetAndGetAllProperties() {
        Regional regional = new Regional();
        LocalDateTime now = LocalDateTime.now();

        regional.setId(10L);
        regional.setExternalId(500);
        regional.setNome("Regional Sul");
        regional.setAtivo(false);
        regional.setCreatedAt(now);
        regional.setUpdatedAt(now);

        assertThat(regional.getId()).isEqualTo(10L);
        assertThat(regional.getExternalId()).isEqualTo(500);
        assertThat(regional.getNome()).isEqualTo("Regional Sul");
        assertThat(regional.getAtivo()).isFalse();
        assertThat(regional.getCreatedAt()).isEqualTo(now);
        assertThat(regional.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should set timestamps on onCreate")
    void shouldSetTimestampsOnCreate() {
        Regional regional = new Regional();
        
        regional.onCreate();

        assertThat(regional.getCreatedAt()).isNotNull();
        assertThat(regional.getUpdatedAt()).isNotNull();
        assertThat(regional.getCreatedAt()).isBeforeOrEqualTo(LocalDateTime.now());
        assertThat(regional.getUpdatedAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should update timestamp on onUpdate")
    void shouldUpdateTimestampOnUpdate() throws InterruptedException {
        Regional regional = new Regional();
        regional.onCreate();
        
        LocalDateTime originalUpdatedAt = regional.getUpdatedAt();
        Thread.sleep(10);
        regional.onUpdate();

        assertThat(regional.getUpdatedAt()).isAfter(originalUpdatedAt);
    }

    @Test
    @DisplayName("Should have default ativo value as true in builder")
    void shouldHaveDefaultAtivoValueInBuilder() {
        Regional regional = Regional.builder()
                .nome("Regional Teste")
                .build();

        assertThat(regional.getAtivo()).isTrue();
    }

    @Test
    @DisplayName("Should allow null external ID")
    void shouldAllowNullExternalId() {
        Regional regional = Regional.builder()
                .nome("Regional Sem ID Externo")
                .externalId(null)
                .build();

        assertThat(regional.getExternalId()).isNull();
    }
}
