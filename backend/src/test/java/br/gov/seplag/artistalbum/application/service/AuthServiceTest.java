package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.AuthResponse;
import br.gov.seplag.artistalbum.application.io.LoginRequest;
import br.gov.seplag.artistalbum.domain.entity.User;
import br.gov.seplag.artistalbum.domain.exception.AuthenticationFailedException;
import br.gov.seplag.artistalbum.domain.exception.InvalidTokenException;
import br.gov.seplag.artistalbum.domain.exception.ResourceNotFoundException;
import br.gov.seplag.artistalbum.domain.repository.UserRepository;
import br.gov.seplag.artistalbum.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Auth Service Tests")
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("admin")
                .password("encodedPassword")
                .build();

        loginRequest = new LoginRequest("admin", "admin123");
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void shouldLoginSuccessfullyWithValidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(testUser)).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(testUser)).thenReturn("refresh-token");
        when(jwtTokenProvider.getExpirationTime()).thenReturn(300000L);

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUsername()).isEqualTo("admin");
        assertThat(response.getExpiresIn()).isEqualTo(300);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider).generateToken(testUser);
        verify(jwtTokenProvider).generateRefreshToken(testUser);
    }

    @Test
    @DisplayName("Should throw AuthenticationFailedException with invalid credentials")
    void shouldThrowExceptionWithInvalidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(AuthenticationFailedException.class)
                .hasMessageContaining("Invalid username or password");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should refresh token successfully with valid refresh token")
    void shouldRefreshTokenSuccessfully() {
        String refreshToken = "valid-refresh-token";

        when(jwtTokenProvider.extractUsername(refreshToken)).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.validateToken(refreshToken, testUser)).thenReturn(true);
        when(jwtTokenProvider.generateToken(testUser)).thenReturn("new-access-token");
        when(jwtTokenProvider.generateRefreshToken(testUser)).thenReturn("new-refresh-token");
        when(jwtTokenProvider.getExpirationTime()).thenReturn(300000L);

        AuthResponse response = authService.refreshToken(refreshToken);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("new-access-token");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh-token");
        assertThat(response.getUsername()).isEqualTo("admin");

        verify(jwtTokenProvider).extractUsername(refreshToken);
        verify(userRepository).findByUsername("admin");
        verify(jwtTokenProvider).validateToken(refreshToken, testUser);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found during token refresh")
    void shouldThrowExceptionWhenUserNotFoundDuringRefresh() {
        String refreshToken = "valid-refresh-token";

        when(jwtTokenProvider.extractUsername(refreshToken)).thenReturn("nonexistent");
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                .isInstanceOf(InvalidTokenException.class);

        verify(jwtTokenProvider).extractUsername(refreshToken);
        verify(userRepository).findByUsername("nonexistent");
    }

    @Test
    @DisplayName("Should throw InvalidTokenException with invalid refresh token")
    void shouldThrowExceptionWithInvalidRefreshToken() {
        String refreshToken = "invalid-refresh-token";

        when(jwtTokenProvider.extractUsername(refreshToken)).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.validateToken(refreshToken, testUser)).thenReturn(false);

        assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Failed to refresh token");

        verify(jwtTokenProvider).extractUsername(refreshToken);
        verify(userRepository).findByUsername("admin");
        verify(jwtTokenProvider).validateToken(refreshToken, testUser);
    }

    @Test
    @DisplayName("Should throw InvalidTokenException when token extraction fails")
    void shouldThrowExceptionWhenTokenExtractionFails() {
        String refreshToken = "malformed-token";

        when(jwtTokenProvider.extractUsername(refreshToken)).thenThrow(new RuntimeException("Token parsing failed"));

        assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Failed to refresh token");

        verify(jwtTokenProvider).extractUsername(refreshToken);
    }
}
