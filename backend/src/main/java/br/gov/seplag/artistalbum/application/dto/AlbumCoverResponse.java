package br.gov.seplag.artistalbum.application.dto;

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
@Schema(description = "Album cover response data")
public class AlbumCoverResponse {

    @JsonProperty("id")
    @Schema(description = "Cover ID", example = "1")
    private Long id;

    @JsonProperty("fileName")
    @Schema(description = "Original file name", example = "harakiri-cover.jpg")
    private String fileName;

    @JsonProperty("contentType")
    @Schema(description = "Content type", example = "image/jpeg")
    private String contentType;

    @JsonProperty("fileSize")
    @Schema(description = "File size in bytes", example = "524288")
    private Long fileSize;

    @JsonProperty("url")
    @Schema(description = "Presigned URL (valid for 30 minutes)", example = "https://minio:9000/album-covers/...")
    private String url;

    @JsonProperty("createdAt")
    @Schema(description = "Upload timestamp")
    private LocalDateTime createdAt;
}
