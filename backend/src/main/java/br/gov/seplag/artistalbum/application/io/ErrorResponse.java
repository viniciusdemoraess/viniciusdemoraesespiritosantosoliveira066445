package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
@Schema(description = "Error response")
public record ErrorResponse(
    @JsonProperty("timestamp")
    @Schema(description = "Error timestamp")
    LocalDateTime timestamp,

    @JsonProperty("status")
    @Schema(description = "HTTP status code", example = "400")
    Integer status,

    @JsonProperty("error")
    @Schema(description = "Error type", example = "Bad Request")
    String error,

    @JsonProperty("message")
    @Schema(description = "Error message")
    String message,

    @JsonProperty("path")
    @Schema(description = "Request path")
    String path
) {}
