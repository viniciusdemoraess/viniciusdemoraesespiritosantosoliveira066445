package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Album request data")
public class AlbumRequest {

    @NotBlank(message = "Album title is required")
    @Size(min = 1, max = 200, message = "Album title must be between 1 and 200 characters")
    @Schema(description = "Album title", example = "Harakiri", required = true)
    @JsonProperty("title")
    private String title;

    @Min(value = 1900, message = "Release year must be at least 1900")
    @Max(value = 2100, message = "Release year must be at most 2100")
    @Schema(description = "Release year", example = "2012")
    @JsonProperty("releaseYear")
    private Integer releaseYear;

    @NotNull(message = "Artist ID is required")
    @Schema(description = "Artist ID", example = "1", required = true)
    @JsonProperty("artistId")
    private Long artistId;
}
