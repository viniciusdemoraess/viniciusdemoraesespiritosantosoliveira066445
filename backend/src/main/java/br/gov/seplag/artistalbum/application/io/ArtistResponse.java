package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Artist response data")
public class ArtistResponse {

    @JsonProperty("id")
    @Schema(description = "Artist ID", example = "1")
    private Long id;

    @JsonProperty("name")
    @Schema(description = "Artist name", example = "Serj Tankian")
    private String name;

    @JsonProperty("albumCount")
    @Schema(description = "Number of albums", example = "3")
    private Integer albumCount;

    @JsonProperty("createdAt")
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}
