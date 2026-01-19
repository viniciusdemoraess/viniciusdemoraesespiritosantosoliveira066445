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
@Schema(description = "Error response")
public class ErrorResponse {

    @JsonProperty("timestamp")
    @Schema(description = "Error timestamp")
    private LocalDateTime timestamp;

    @JsonProperty("status")
    @Schema(description = "HTTP status code", example = "400")
    private Integer status;

    @JsonProperty("error")
    @Schema(description = "Error type", example = "Bad Request")
    private String error;

    @JsonProperty("message")
    @Schema(description = "Error message")
    private String message;

    @JsonProperty("path")
    @Schema(description = "Request path")
    private String path;
}
