package br.gov.seplag.artistalbum.application.io;

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
    @Size(min = 3, max = 200, message = "Artist name must be between 3 and 200 characters")
    @Schema(description = "Artist name", example = "Serj Tankian", required = true)
    @JsonProperty("name")
    private String name;

    @Size(max = 100, message = "Artist type must not exceed 100 characters")
    @Schema(description = "Artist type", example = "Cantor")
    @JsonProperty("artistType")
    private String artistType;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Schema(description = "Country of origin", example = "Brasil")
    @JsonProperty("country")
    private String country;

    @Schema(description = "Artist biography")
    @JsonProperty("biography")
    private String biography;
}
