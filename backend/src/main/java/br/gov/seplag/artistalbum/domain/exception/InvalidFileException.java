package br.gov.seplag.artistalbum.domain.exception;

/**
 * Exception thrown when a file is invalid or doesn't meet requirements
 */
public class InvalidFileException extends RuntimeException {
    
    private final String reason;

    public InvalidFileException(String reason) {
        super(reason);
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }
}
