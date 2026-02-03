package br.gov.seplag.artistalbum.infrastructure.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = authentication.getName();
        String rateLimitKey = "rate-limit:" + username;

        if (!rateLimitService.tryConsume(rateLimitKey)) {
            log.warn("Rate limit exceeded for user: {} on path: {}", username, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\": \"Too Many Requests\", " +
                            "\"message\": \"Limite de requisições atingido. Aguarde um momento antes de tentar novamente.\"}"
            );
            return;
        }

        long availableTokens = rateLimitService.getAvailableTokens(rateLimitKey);
        response.addHeader("X-RateLimit-Limit", "10");
        response.addHeader("X-RateLimit-Remaining", String.valueOf(availableTokens));
        
        log.debug("Rate limit check passed for user: {} on path: {}. Remaining: {}", username, path, availableTokens);

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        return path.contains("/auth/") ||
                path.contains("/actuator/") ||
                path.contains("/swagger-ui") ||
                path.contains("/v3/api-docs") ||
                path.contains("/ws/");
    }
}
