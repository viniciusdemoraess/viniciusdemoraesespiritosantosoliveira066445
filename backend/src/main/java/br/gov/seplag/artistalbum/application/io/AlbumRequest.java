package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Album request data")
public class AlbumRequest {

    @NotBlank(message = "Album title is required")
    @Size(min = 3, max = 200, message = "Album title must be between 3 and 200 characters")
    @Schema(description = "Album title", example = "Harakiri", required = true)
    @JsonProperty("title")
    private String title;

    @Min(value = 1900, message = "Release year must be at least 1900")
    @Max(value = 2100, message = "Release year must be at most 2100")
    @Schema(description = "Release year", example = "2012")
    @JsonProperty("releaseYear")
    private Integer releaseYear;

    @Size(max = 100, message = "Genre must not exceed 100 characters")
    @Schema(description = "Music genre", example = "Rock")
    @JsonProperty("genre")
    private String genre;

    @Size(max = 200, message = "Record label must not exceed 200 characters")
    @Schema(description = "Record label", example = "Universal Music")
    @JsonProperty("recordLabel")
    private String recordLabel;

    @Min(value = 1, message = "Total tracks must be at least 1")
    @Schema(description = "Total number of tracks", example = "12")
    @JsonProperty("totalTracks")
    private Integer totalTracks;

    @Min(value = 1, message = "Total duration must be at least 1 second")
    @Schema(description = "Total duration in seconds", example = "2400")
    @JsonProperty("totalDurationSeconds")
    private Integer totalDurationSeconds;

    @Schema(description = "Artist ID (deprecated, use artistIds)", example = "1")
    @JsonProperty("artistId")
    private Long artistId;

    @Schema(description = "List of Artist IDs", example = "[1, 2]")
    @JsonProperty("artistIds")
    private List<Long> artistIds;
}
