package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Schema(description = "Album response data")
public record AlbumResponse(
    @JsonProperty("id")
    @Schema(description = "Album ID", example = "1")
    Long id,

    @JsonProperty("title")
    @Schema(description = "Album title", example = "Harakiri")
    String title,

    @JsonProperty("releaseYear")
    @Schema(description = "Release year", example = "2012")
    Integer releaseYear,

    @JsonProperty("genre")
    @Schema(description = "Music genre", example = "Rock")
    String genre,

    @JsonProperty("recordLabel")
    @Schema(description = "Record label", example = "Universal Music")
    String recordLabel,

    @JsonProperty("totalTracks")
    @Schema(description = "Total number of tracks", example = "12")
    Integer totalTracks,

    @JsonProperty("totalDurationSeconds")
    @Schema(description = "Total duration in seconds", example = "2400")
    Integer totalDurationSeconds,

    @JsonProperty("artistId")
    @Schema(description = "Artist ID (deprecated, use artists)", example = "1")
    Long artistId,

    @JsonProperty("artistName")
    @Schema(description = "Artist name (deprecated, use artists)", example = "Serj Tankian")
    String artistName,

    @JsonProperty("artists")
    @Schema(description = "List of artists")
    List<ArtistSummary> artists,

    @JsonProperty("covers")
    @Schema(description = "Album covers")
    List<AlbumCoverResponse> covers,

    @JsonProperty("createdAt")
    @Schema(description = "Creation timestamp")
    LocalDateTime createdAt,

    @JsonProperty("updatedAt")
    @Schema(description = "Last update timestamp")
    LocalDateTime updatedAt
) {}
