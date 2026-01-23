package br.gov.seplag.artistalbum.infrastructure.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;

import java.io.IOException;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationEntryPoint Tests")
class JwtAuthenticationEntryPointTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private ServletOutputStream outputStream;

    @InjectMocks
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @BeforeEach
    void setUp() throws IOException {
        when(response.getOutputStream()).thenReturn(outputStream);
    }

    @Test
    @DisplayName("Should return 401 with error details when authentication fails")
    void shouldReturn401WithErrorDetailsWhenAuthenticationFails() throws IOException, ServletException {
        // Arrange
        AuthenticationException authException = new AuthenticationException("Invalid credentials") {};
        when(request.getServletPath()).thenReturn("/api/albums");

        // Act
        jwtAuthenticationEntryPoint.commence(request, response, authException);

        // Assert
        verify(response).setContentType(MediaType.APPLICATION_JSON_VALUE);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).getOutputStream();
        verify(outputStream).write(any(byte[].class), anyInt(), anyInt());
    }

    @Test
    @DisplayName("Should include request path in error response")
    void shouldIncludeRequestPathInErrorResponse() throws IOException, ServletException {
        // Arrange
        AuthenticationException authException = new AuthenticationException("Token expired") {};
        when(request.getServletPath()).thenReturn("/api/protected-resource");

        // Act
        jwtAuthenticationEntryPoint.commence(request, response, authException);

        // Assert
        verify(request).getServletPath();
        verify(response).getOutputStream();
    }

    @Test
    @DisplayName("Should handle null authentication exception message")
    void shouldHandleNullAuthenticationExceptionMessage() throws IOException, ServletException {
        // Arrange
        AuthenticationException authException = new AuthenticationException(null) {};
        when(request.getServletPath()).thenReturn("/api/test");

        // Act
        jwtAuthenticationEntryPoint.commence(request, response, authException);

        // Assert
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).getOutputStream();
    }
}
