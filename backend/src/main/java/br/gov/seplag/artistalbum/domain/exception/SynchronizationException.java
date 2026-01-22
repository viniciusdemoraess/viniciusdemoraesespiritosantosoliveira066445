package br.gov.seplag.artistalbum.domain.exception;

/**
 * Exception thrown when synchronization operations fail
 */
public class SynchronizationException extends RuntimeException {
    
    private final String resource;

    public SynchronizationException(String resource, String message, Throwable cause) {
        super(String.format("Failed to synchronize %s: %s", resource, message), cause);
        this.resource = resource;
    }

    public String getResource() {
        return resource;
    }
}
