package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "Artist summary data")
public record ArtistSummary(
    @JsonProperty("id")
    @Schema(description = "Artist ID", example = "1")
    Long id,

    @JsonProperty("name")
    @Schema(description = "Artist name", example = "Serj Tankian")
    String name,

    @JsonProperty("artistType")
    @Schema(description = "Artist type", example = "Solo")
    String artistType,

    @JsonProperty("country")
    @Schema(description = "Country", example = "United States")
    String country
) {}
