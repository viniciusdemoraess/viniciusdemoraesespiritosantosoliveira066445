package br.gov.seplag.artistalbum.application.io;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AlbumRequest Tests")
class AlbumRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid album request")
    void shouldCreateValidAlbumRequest() {
        AlbumRequest request = AlbumRequest.builder()
                .title("Toxicity")
                .releaseYear(2001)
                .artistId(1L)
                .build();

        Set<ConstraintViolation<AlbumRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when title is blank")
    void shouldFailValidationWhenTitleIsBlank() {
        AlbumRequest request = AlbumRequest.builder()
                .title("")
                .releaseYear(2001)
                .artistId(1L)
                .build();

        Set<ConstraintViolation<AlbumRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getMessage().contains("required"));
    }

    @Test
    @DisplayName("Should fail validation when title is too long")
    void shouldFailValidationWhenTitleIsTooLong() {
        String longTitle = "a".repeat(201);
        AlbumRequest request = AlbumRequest.builder()
                .title(longTitle)
                .releaseYear(2001)
                .artistId(1L)
                .build();

        Set<ConstraintViolation<AlbumRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getMessage().contains("between 1 and 200"));
    }

    @Test
    @DisplayName("Should fail validation when artistId is null")
    void shouldFailValidationWhenArtistIdIsNull() {
        AlbumRequest request = AlbumRequest.builder()
                .title("Toxicity")
                .releaseYear(2001)
                .build();

        Set<ConstraintViolation<AlbumRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getMessage().contains("Artist ID is required"));
    }

    @Test
    @DisplayName("Should fail validation when release year is too old")
    void shouldFailValidationWhenReleaseYearIsTooOld() {
        AlbumRequest request = AlbumRequest.builder()
                .title("Toxicity")
                .releaseYear(1899)
                .artistId(1L)
                .build();

        Set<ConstraintViolation<AlbumRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getMessage().contains("at least 1900"));
    }

    @Test
    @DisplayName("Should fail validation when release year is too future")
    void shouldFailValidationWhenReleaseYearIsTooFuture() {
        AlbumRequest request = AlbumRequest.builder()
                .title("Toxicity")
                .releaseYear(2101)
                .artistId(1L)
                .build();

        Set<ConstraintViolation<AlbumRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getMessage().contains("at most 2100"));
    }

    @Test
    @DisplayName("Should set and get all properties correctly")
    void shouldSetAndGetAllPropertiesCorrectly() {
        AlbumRequest request = new AlbumRequest();
        request.setTitle("Mezmerize");
        request.setReleaseYear(2005);
        request.setArtistId(2L);

        assertThat(request.getTitle()).isEqualTo("Mezmerize");
        assertThat(request.getReleaseYear()).isEqualTo(2005);
        assertThat(request.getArtistId()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Should create with all args constructor")
    void shouldCreateWithAllArgsConstructor() {
        AlbumRequest request = AlbumRequest.builder()
                .title("Hypnotize")
                .releaseYear(2005)
                .artistId(3L)
                .genre("Rock")
                .recordLabel("Columbia Records")
                .totalTracks(12)
                .totalDurationSeconds(2400)
                .build();

        assertThat(request.getTitle()).isEqualTo("Hypnotize");
        assertThat(request.getReleaseYear()).isEqualTo(2005);
        assertThat(request.getArtistId()).isEqualTo(3L);
        assertThat(request.getGenre()).isEqualTo("Rock");
        assertThat(request.getRecordLabel()).isEqualTo("Columbia Records");
        assertThat(request.getTotalTracks()).isEqualTo(12);
        assertThat(request.getTotalDurationSeconds()).isEqualTo(2400);
    }

    @Test
    @DisplayName("Should allow null release year")
    void shouldAllowNullReleaseYear() {
        AlbumRequest request = AlbumRequest.builder()
                .title("Toxicity")
                .artistId(1L)
                .build();

        Set<ConstraintViolation<AlbumRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }
}
