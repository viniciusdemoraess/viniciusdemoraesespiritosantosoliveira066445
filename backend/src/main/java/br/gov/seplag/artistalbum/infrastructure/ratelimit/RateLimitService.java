package br.gov.seplag.artistalbum.infrastructure.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Slf4j
@Component
public class RateLimitService {

    @Value("${rate-limit.requests-per-minute:10}")
    private int requestsPerMinute;

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> createNewBucket());
    }

    private Bucket createNewBucket() {
        // Capacidade máxima de 10 tokens
        // Recarga de 10 tokens a cada 1 minuto de forma intervalar
        // Isso garante exatamente 10 requisições por janela de 1 minuto
        Bandwidth limit = Bandwidth.builder()
                .capacity(requestsPerMinute)
                .refillIntervally(requestsPerMinute, Duration.ofMinutes(1))
                .build();
        
        Bucket bucket = Bucket.builder()
                .addLimit(limit)
                .build();
                
        log.debug("Created new rate limit bucket with capacity: {} tokens per minute", requestsPerMinute);
        return bucket;
    }

    public boolean tryConsume(String key) {
        Bucket bucket = resolveBucket(key);
        boolean consumed = bucket.tryConsume(1);
        long available = bucket.getAvailableTokens();
        log.debug("Rate limit attempt for key: {}. Consumed: {}, Remaining: {}", key, consumed, available);
        return consumed;
    }

    public long getAvailableTokens(String key) {
        Bucket bucket = resolveBucket(key);
        return bucket.getAvailableTokens();
    }
}
