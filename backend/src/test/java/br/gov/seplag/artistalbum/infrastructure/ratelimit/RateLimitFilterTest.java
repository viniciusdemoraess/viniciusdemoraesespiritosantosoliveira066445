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

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RateLimitFilter rateLimitFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
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

    @Test
    @DisplayName("Should allow request when user is not authenticated")
    void shouldAllowRequestWhenUserIsNotAuthenticated() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/albums");
        when(securityContext.getAuthentication()).thenReturn(null);

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).tryConsume(anyString());
    }

    @Test
    @DisplayName("Should allow request when authentication is anonymous")
    void shouldAllowRequestWhenAuthenticationIsAnonymous() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/albums");
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("anonymousUser");
        when(securityContext.getAuthentication()).thenReturn(authentication);

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).tryConsume(anyString());
    }

    @Test
    @DisplayName("Should apply rate limiting to authenticated user")
    void shouldApplyRateLimitingToAuthenticatedUser() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/albums");
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(rateLimitService.tryConsume("rate-limit:testuser")).thenReturn(true);
        when(rateLimitService.getAvailableTokens("rate-limit:testuser")).thenReturn(7L);

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(rateLimitService).tryConsume("rate-limit:testuser");
        verify(response).addHeader("X-RateLimit-Limit", "10");
        verify(response).addHeader("X-RateLimit-Remaining", "7");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should block request when rate limit exceeded")
    void shouldBlockRequestWhenRateLimitExceeded() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/albums");
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(rateLimitService.tryConsume("rate-limit:testuser")).thenReturn(false);
        
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(rateLimitService).tryConsume("rate-limit:testuser");
        verify(response).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        verify(response).setContentType("application/json");
        verify(filterChain, never()).doFilter(request, response);
        
        String jsonResponse = stringWriter.toString();
        assertThat(jsonResponse).contains("Too Many Requests");
        assertThat(jsonResponse).contains("Limite de requisições atingido");
    }

    @Test
    @DisplayName("Should set correct rate limit headers")
    void shouldSetCorrectRateLimitHeaders() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/artists");
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(rateLimitService.tryConsume("rate-limit:testuser")).thenReturn(true);
        when(rateLimitService.getAvailableTokens("rate-limit:testuser")).thenReturn(3L);

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(response).addHeader("X-RateLimit-Limit", "10");
        verify(response).addHeader("X-RateLimit-Remaining", "3");
    }

    @Test
    @DisplayName("Should handle unauthenticated user in security context")
    void shouldHandleUnauthenticatedUserInSecurityContext() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/albums");
        when(authentication.isAuthenticated()).thenReturn(false);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).tryConsume(anyString());
    }
}
