package br.gov.seplag.artistalbum.infrastructure.security;

import br.gov.seplag.artistalbum.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JWT Token Provider Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private UserDetails testUser;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "secret", 
                "your-super-secret-key-change-in-production-minimum-256-bits-required");
        ReflectionTestUtils.setField(jwtTokenProvider, "expiration", 300000L); // 5 minutes
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpiration", 86400000L); // 24 hours

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .password("password")
                .email("test@example.com")
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("Should generate valid JWT token")
    void shouldGenerateValidJwtToken() {
        String token = jwtTokenProvider.generateToken(testUser);

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    @Test
    @DisplayName("Should extract username from token")
    void shouldExtractUsernameFromToken() {
        String token = jwtTokenProvider.generateToken(testUser);

        String username = jwtTokenProvider.extractUsername(token);

        assertThat(username).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should validate token successfully")
    void shouldValidateTokenSuccessfully() {
        String token = jwtTokenProvider.generateToken(testUser);

        Boolean isValid = jwtTokenProvider.validateToken(token, testUser);

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should detect non-expired token")
    void shouldDetectNonExpiredToken() {
        String token = jwtTokenProvider.generateToken(testUser);

        Boolean isExpired = jwtTokenProvider.isTokenExpired(token);

        assertThat(isExpired).isFalse();
    }

    @Test
    @DisplayName("Should generate refresh token")
    void shouldGenerateRefreshToken() {
        String refreshToken = jwtTokenProvider.generateRefreshToken(testUser);

        assertThat(refreshToken).isNotNull();
        assertThat(refreshToken).isNotEmpty();
        
        String username = jwtTokenProvider.extractUsername(refreshToken);
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should return expiration time")
    void shouldReturnExpirationTime() {
        Long expirationTime = jwtTokenProvider.getExpirationTime();

        assertThat(expirationTime).isEqualTo(300000L);
    }
}
