package br.gov.seplag.artistalbum.application.io;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record RegionalDTO(
    @JsonProperty("id")
    Integer id,

    @JsonProperty("nome")
    String nome
) {}
