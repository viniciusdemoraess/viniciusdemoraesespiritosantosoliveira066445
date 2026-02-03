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

    @Test
    @DisplayName("Should reuse same bucket for same key")
    void shouldReuseSameBucketForSameKey() {
        String key = "test-user";
        
        Bucket bucket1 = rateLimitService.resolveBucket(key);
        bucket1.tryConsume(3);
        
        Bucket bucket2 = rateLimitService.resolveBucket(key);
        
        assertThat(bucket2.getAvailableTokens()).isEqualTo(7);
        assertThat(bucket1).isSameAs(bucket2);
    }

    @Test
    @DisplayName("Should allow zero available tokens after consuming all")
    void shouldAllowZeroAvailableTokens() {
        String key = "test-user";

        for (int i = 0; i < 10; i++) {
            rateLimitService.tryConsume(key);
        }

        long availableTokens = rateLimitService.getAvailableTokens(key);
        assertThat(availableTokens).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle multiple users concurrently")
    void shouldHandleMultipleUsersConcurrently() {
        String user1 = "user1";
        String user2 = "user2";
        String user3 = "user3";

        rateLimitService.tryConsume(user1);
        rateLimitService.tryConsume(user1);
        
        rateLimitService.tryConsume(user2);
        rateLimitService.tryConsume(user2);
        rateLimitService.tryConsume(user2);
        
        rateLimitService.tryConsume(user3);

        assertThat(rateLimitService.getAvailableTokens(user1)).isEqualTo(8);
        assertThat(rateLimitService.getAvailableTokens(user2)).isEqualTo(7);
        assertThat(rateLimitService.getAvailableTokens(user3)).isEqualTo(9);
    }

    @Test
    @DisplayName("Should create bucket with correct capacity")
    void shouldCreateBucketWithCorrectCapacity() {
        String key = "new-user";
        Bucket bucket = rateLimitService.resolveBucket(key);

        assertThat(bucket.getAvailableTokens()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should handle rapid consumption attempts")
    void shouldHandleRapidConsumptionAttempts() {
        String key = "rapid-user";

        boolean lastResult = true;
        for (int i = 0; i < 15; i++) {
            boolean result = rateLimitService.tryConsume(key);
            if (i < 10) {
                assertThat(result).isTrue();
            } else {
                assertThat(result).isFalse();
                lastResult = result;
            }
        }

        assertThat(lastResult).isFalse();
        assertThat(rateLimitService.getAvailableTokens(key)).isEqualTo(0);
    }
}
