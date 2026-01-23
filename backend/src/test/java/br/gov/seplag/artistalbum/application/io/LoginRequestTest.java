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

@DisplayName("LoginRequest Tests")
class LoginRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid login request")
    void shouldCreateValidLoginRequest() {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("admin123")
                .build();

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Should fail validation when username is blank")
    void shouldFailValidationWhenUsernameIsBlank() {
        LoginRequest request = LoginRequest.builder()
                .username("")
                .password("admin123")
                .build();

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getMessage().contains("required"));
    }

    @Test
    @DisplayName("Should fail validation when password is blank")
    void shouldFailValidationWhenPasswordIsBlank() {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("")
                .build();

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getMessage().contains("required"));
    }

    @Test
    @DisplayName("Should fail validation when both fields are blank")
    void shouldFailValidationWhenBothFieldsAreBlank() {
        LoginRequest request = LoginRequest.builder()
                .username("")
                .password("")
                .build();

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations).hasSize(2);
    }

    @Test
    @DisplayName("Should set and get all properties correctly")
    void shouldSetAndGetAllPropertiesCorrectly() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("testpass");

        assertThat(request.getUsername()).isEqualTo("testuser");
        assertThat(request.getPassword()).isEqualTo("testpass");
    }

    @Test
    @DisplayName("Should create with all args constructor")
    void shouldCreateWithAllArgsConstructor() {
        LoginRequest request = new LoginRequest("user123", "pass456");

        assertThat(request.getUsername()).isEqualTo("user123");
        assertThat(request.getPassword()).isEqualTo("pass456");
    }

    @Test
    @DisplayName("Should create with no args constructor")
    void shouldCreateWithNoArgsConstructor() {
        LoginRequest request = new LoginRequest();

        assertThat(request).isNotNull();
        assertThat(request.getUsername()).isNull();
        assertThat(request.getPassword()).isNull();
    }
}
