package br.gov.seplag.artistalbum.domain.exception;

/**
 * Exception thrown when storage operations fail
 */
public class StorageException extends RuntimeException {
    
    private final String operation;

    public StorageException(String operation, String message, Throwable cause) {
        super(String.format("Failed to %s: %s", operation, message), cause);
        this.operation = operation;
    }

    public StorageException(String message, Throwable cause) {
        super(message, cause);
        this.operation = null;
    }

    public String getOperation() {
        return operation;
    }
}
