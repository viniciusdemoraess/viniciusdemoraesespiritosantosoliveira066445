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
        String key = "test-user";

        for (int i = 0; i < 10; i++) {
            boolean allowed = rateLimitService.tryConsume(key);
            assertThat(allowed).isTrue();
        }
    }

    @Test
    @DisplayName("Should block requests exceeding limit")
    void shouldBlockRequestsExceedingLimit() {
        String key = "test-user";

        for (int i = 0; i < 10; i++) {
            rateLimitService.tryConsume(key);
        }

        boolean allowed = rateLimitService.tryConsume(key);
        assertThat(allowed).isFalse();
    }

    @Test
    @DisplayName("Should return correct available tokens")
    void shouldReturnCorrectAvailableTokens() {
        String key = "test-user";

        rateLimitService.tryConsume(key);
        rateLimitService.tryConsume(key);
        rateLimitService.tryConsume(key);
        long availableTokens = rateLimitService.getAvailableTokens(key);

        assertThat(availableTokens).isEqualTo(7);
    }

    @Test
    @DisplayName("Should create separate buckets for different users")
    void shouldCreateSeparateBucketsForDifferentUsers() {
        String user1 = "user1";
        String user2 = "user2";

        rateLimitService.tryConsume(user1);
        rateLimitService.tryConsume(user1);
        rateLimitService.tryConsume(user1);

        long user1Tokens = rateLimitService.getAvailableTokens(user1);
        long user2Tokens = rateLimitService.getAvailableTokens(user2);

        assertThat(user1Tokens).isEqualTo(7);
        assertThat(user2Tokens).isEqualTo(10);
    }

    @Test
    @DisplayName("Should resolve bucket for key")
    void shouldResolveBucketForKey() {
        String key = "test-user";
        Bucket bucket = rateLimitService.resolveBucket(key);

        assertThat(bucket).isNotNull();
        assertThat(bucket.getAvailableTokens()).isEqualTo(10);
    }
}
