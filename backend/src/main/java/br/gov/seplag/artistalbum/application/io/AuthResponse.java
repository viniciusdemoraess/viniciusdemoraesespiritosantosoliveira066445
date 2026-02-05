package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "Authentication response")
public record AuthResponse(
    @JsonProperty("accessToken")
    @Schema(description = "JWT access token (expires in 5 minutes)")
    String accessToken,

    @JsonProperty("refreshToken")
    @Schema(description = "Refresh token (expires in 24 hours)")
    String refreshToken,

    @JsonProperty("tokenType")
    @Schema(description = "Token type", example = "Bearer")
    String tokenType,

    @JsonProperty("expiresIn")
    @Schema(description = "Token expiration in seconds", example = "300")
    Long expiresIn,

    @JsonProperty("username")
    @Schema(description = "Username", example = "admin")
    String username
) {
    // Default value for tokenType
    public AuthResponse {
        if (tokenType == null) {
            tokenType = "Bearer";
        }
    }
}
