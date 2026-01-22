package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.AuthResponse;
import br.gov.seplag.artistalbum.application.io.LoginRequest;
import br.gov.seplag.artistalbum.domain.entity.User;
import br.gov.seplag.artistalbum.domain.exception.AuthenticationFailedException;
import br.gov.seplag.artistalbum.domain.exception.InvalidTokenException;
import br.gov.seplag.artistalbum.domain.exception.ResourceNotFoundException;
import br.gov.seplag.artistalbum.domain.repository.UserRepository;
import br.gov.seplag.artistalbum.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication Service
 * Handles login and token refresh
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            User user = (User) authentication.getPrincipal();
            String accessToken = jwtTokenProvider.generateToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            log.info("User logged in successfully: {}", user.getUsername());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtTokenProvider.getExpirationTime() / 1000) // Convert to seconds
                    .username(user.getUsername())
                    .build();

        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {}", request.getUsername());
            throw new AuthenticationFailedException("Invalid username or password");
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        try {
            String username = jwtTokenProvider.extractUsername(refreshToken);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

            if (jwtTokenProvider.validateToken(refreshToken, user)) {
                String newAccessToken = jwtTokenProvider.generateToken(user);
                String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

                log.info("Token refreshed for user: {}", username);

                return AuthResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .tokenType("Bearer")
                        .expiresIn(jwtTokenProvider.getExpirationTime() / 1000)
                        .username(user.getUsername())
                        .build();
            }

            throw new InvalidTokenException("Invalid refresh token");

        } catch (Exception e) {
            log.error("Token refresh failed", e);
            throw new InvalidTokenException("Failed to refresh token", e);
        }
    }
}
