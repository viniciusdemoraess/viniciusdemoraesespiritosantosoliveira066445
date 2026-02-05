package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
@Schema(description = "Album cover response data")
public record AlbumCoverResponse(
    @JsonProperty("id")
    @Schema(description = "Cover ID", example = "1")
    Long id,

    @JsonProperty("fileName")
    @Schema(description = "Original file name", example = "harakiri-cover.jpg")
    String fileName,

    @JsonProperty("contentType")
    @Schema(description = "Content type", example = "image/jpeg")
    String contentType,

    @JsonProperty("fileSize")
    @Schema(description = "File size in bytes", example = "524288")
    Long fileSize,

    @JsonProperty("url")
    @Schema(description = "Presigned URL (valid for 30 minutes)", example = "https://minio:9000/album-covers/...")
    String url,

    @JsonProperty("createdAt")
    @Schema(description = "Upload timestamp")
    LocalDateTime createdAt
) {}
