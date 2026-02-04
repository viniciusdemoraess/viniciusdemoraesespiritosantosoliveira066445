package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
@Schema(description = "Artist response data")
public record ArtistResponse(
    @JsonProperty("id")
    @Schema(description = "Artist ID", example = "1")
    Long id,

    @JsonProperty("name")
    @Schema(description = "Artist name", example = "Serj Tankian")
    String name,

    @JsonProperty("artistType")
    @Schema(description = "Artist type", example = "Cantor")
    String artistType,

    @JsonProperty("country")
    @Schema(description = "Country of origin", example = "Brasil")
    String country,

    @JsonProperty("biography")
    @Schema(description = "Artist biography")
    String biography,

    @JsonProperty("albumCount")
    @Schema(description = "Number of albums", example = "3")
    Integer albumCount,

    @JsonProperty("createdAt")
    @Schema(description = "Creation timestamp")
    LocalDateTime createdAt,

    @JsonProperty("updatedAt")
    @Schema(description = "Last update timestamp")
    LocalDateTime updatedAt
) {}
