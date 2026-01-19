package br.gov.seplag.artistalbum.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Artist request data")
public class ArtistRequest {

    @NotBlank(message = "Artist name is required")
    @Size(min = 2, max = 200, message = "Artist name must be between 2 and 200 characters")
    @Schema(description = "Artist name", example = "Serj Tankian", required = true)
    @JsonProperty("name")
    private String name;
}
