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
@Schema(description = "Artist summary data")
public class ArtistSummary {

    @JsonProperty("id")
    @Schema(description = "Artist ID", example = "1")
    private Long id;

    @JsonProperty("name")
    @Schema(description = "Artist name", example = "Serj Tankian")
    private String name;

    @JsonProperty("artistType")
    @Schema(description = "Artist type", example = "Solo")
    private String artistType;

    @JsonProperty("country")
    @Schema(description = "Country", example = "United States")
    private String country;
}
