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

    @JsonProperty("artistId")
    @Schema(description = "Artist ID", example = "1")
    private Long artistId;

    @JsonProperty("artistName")
    @Schema(description = "Artist name", example = "Serj Tankian")
    private String artistName;

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
