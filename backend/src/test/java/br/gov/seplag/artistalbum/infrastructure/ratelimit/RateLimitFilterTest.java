package br.gov.seplag.artistalbum.infrastructure.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Rate Limit Filter Tests")
class RateLimitFilterTest {

    @Mock
    private RateLimitService rateLimitService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private RateLimitFilter rateLimitFilter;

    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        securityContext = mock(SecurityContext.class);
        SecurityContextHolder.setContext(securityContext);
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password");
    }

    @Test
    @DisplayName("Should allow request to public endpoint without rate limiting")
    void shouldAllowRequestToPublicEndpoint() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).tryConsume(anyString());
    }

    @Test
    @DisplayName("Should allow request to actuator endpoint")
    void shouldAllowRequestToActuatorEndpoint() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/actuator/health");

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).tryConsume(anyString());
    }

    @Test
    @DisplayName("Should allow request to swagger endpoint")
    void shouldAllowRequestToSwaggerEndpoint() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/swagger-ui/index.html");

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).tryConsume(anyString());
    }

    @Test
    @DisplayName("Should allow request to api-docs endpoint")
    void shouldAllowRequestToApiDocsEndpoint() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/v3/api-docs");

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).tryConsume(anyString());
    }

    @Test
    @DisplayName("Should allow request to websocket endpoint")
    void shouldAllowRequestToWebsocketEndpoint() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/ws/notifications");

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).tryConsume(anyString());
    }
}
