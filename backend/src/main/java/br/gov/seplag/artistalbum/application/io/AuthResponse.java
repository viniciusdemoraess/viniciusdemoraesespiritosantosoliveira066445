package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authentication response")
public class AuthResponse {

    @JsonProperty("accessToken")
    @Schema(description = "JWT access token (expires in 5 minutes)")
    private String accessToken;

    @JsonProperty("refreshToken")
    @Schema(description = "Refresh token (expires in 24 hours)")
    private String refreshToken;

    @JsonProperty("tokenType")
    @Schema(description = "Token type", example = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";

    @JsonProperty("expiresIn")
    @Schema(description = "Token expiration in seconds", example = "300")
    private Long expiresIn;

    @JsonProperty("username")
    @Schema(description = "Username", example = "admin")
    private String username;
}
