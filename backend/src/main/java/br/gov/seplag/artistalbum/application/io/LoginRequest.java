package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
@Schema(description = "Login request")
public record LoginRequest(
    @NotBlank(message = "Username is required")
    @Schema(description = "Username", example = "admin", required = true)
    @JsonProperty("username")
    String username,

    @NotBlank(message = "Password is required")
    @Schema(description = "Password", example = "admin123", required = true)
    @JsonProperty("password")
    String password
) {}
