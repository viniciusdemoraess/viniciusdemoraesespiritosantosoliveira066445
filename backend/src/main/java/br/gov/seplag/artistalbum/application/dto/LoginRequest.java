package br.gov.seplag.artistalbum.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login request")
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Schema(description = "Username", example = "admin", required = true)
    @JsonProperty("username")
    private String username;

    @NotBlank(message = "Password is required")
    @Schema(description = "Password", example = "admin123", required = true)
    @JsonProperty("password")
    private String password;
}
