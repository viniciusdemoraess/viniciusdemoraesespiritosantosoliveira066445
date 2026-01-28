package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Album response data")
public class AlbumResponse {

    @JsonProperty("id")
    @Schema(description = "Album ID", example = "1")
    private Long id;

    @JsonProperty("title")
    @Schema(description = "Album title", example = "Harakiri")
    private String title;

    @JsonProperty("releaseYear")
    @Schema(description = "Release year", example = "2012")
    private Integer releaseYear;

    @JsonProperty("genre")
    @Schema(description = "Music genre", example = "Rock")
    private String genre;

    @JsonProperty("recordLabel")
    @Schema(description = "Record label", example = "Universal Music")
    private String recordLabel;

    @JsonProperty("totalTracks")
    @Schema(description = "Total number of tracks", example = "12")
    private Integer totalTracks;

    @JsonProperty("totalDurationSeconds")
    @Schema(description = "Total duration in seconds", example = "2400")
    private Integer totalDurationSeconds;

    @JsonProperty("artistId")
    @Schema(description = "Artist ID (deprecated, use artists)", example = "1")
    private Long artistId;

    @JsonProperty("artistName")
    @Schema(description = "Artist name (deprecated, use artists)", example = "Serj Tankian")
    private String artistName;

    @JsonProperty("artists")
    @Schema(description = "List of artists")
    private List<ArtistSummary> artists;

    @JsonProperty("covers")
    @Schema(description = "Album covers")
    private List<AlbumCoverResponse> covers;

    @JsonProperty("createdAt")
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}
