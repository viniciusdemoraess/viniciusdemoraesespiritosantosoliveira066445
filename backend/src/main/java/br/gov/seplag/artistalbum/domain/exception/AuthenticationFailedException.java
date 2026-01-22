package br.gov.seplag.artistalbum.domain.exception;

/**
 * Exception thrown when authentication fails
 */
public class AuthenticationFailedException extends RuntimeException {
    
    public AuthenticationFailedException(String message) {
        super(message);
    }

    public AuthenticationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
