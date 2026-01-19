package br.gov.seplag.artistalbum.infrastructure.ratelimit;

import io.github.bucket4j.Bucket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Rate Limit Service Tests")
class RateLimitServiceTest {

    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        rateLimitService = new RateLimitService();
        ReflectionTestUtils.setField(rateLimitService, "requestsPerMinute", 10);
    }

    @Test
    @DisplayName("Should allow requests within limit")
    void shouldAllowRequestsWithinLimit() {
        // Arrange
        String key = "test-user";

        // Act & Assert
        for (int i = 0; i < 10; i++) {
            boolean allowed = rateLimitService.tryConsume(key);
            assertThat(allowed).isTrue();
        }
    }

    @Test
    @DisplayName("Should block requests exceeding limit")
    void shouldBlockRequestsExceedingLimit() {
        // Arrange
        String key = "test-user";

        // Act - Consume all 10 tokens
        for (int i = 0; i < 10; i++) {
            rateLimitService.tryConsume(key);
        }

        // Assert - 11th request should be blocked
        boolean allowed = rateLimitService.tryConsume(key);
        assertThat(allowed).isFalse();
    }

    @Test
    @DisplayName("Should return correct available tokens")
    void shouldReturnCorrectAvailableTokens() {
        // Arrange
        String key = "test-user";

        // Act
        rateLimitService.tryConsume(key);
        rateLimitService.tryConsume(key);
        rateLimitService.tryConsume(key);
        long availableTokens = rateLimitService.getAvailableTokens(key);

        // Assert
        assertThat(availableTokens).isEqualTo(7);
    }

    @Test
    @DisplayName("Should create separate buckets for different users")
    void shouldCreateSeparateBucketsForDifferentUsers() {
        // Arrange
        String user1 = "user1";
        String user2 = "user2";

        // Act
        rateLimitService.tryConsume(user1);
        rateLimitService.tryConsume(user1);
        rateLimitService.tryConsume(user1);

        long user1Tokens = rateLimitService.getAvailableTokens(user1);
        long user2Tokens = rateLimitService.getAvailableTokens(user2);

        // Assert
        assertThat(user1Tokens).isEqualTo(7);
        assertThat(user2Tokens).isEqualTo(10);
    }

    @Test
    @DisplayName("Should resolve bucket for key")
    void shouldResolveBucketForKey() {
        // Arrange
        String key = "test-user";

        // Act
        Bucket bucket = rateLimitService.resolveBucket(key);

        // Assert
        assertThat(bucket).isNotNull();
        assertThat(bucket.getAvailableTokens()).isEqualTo(10);
    }
}
