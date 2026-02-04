package br.gov.seplag.artistalbum.application.util;

import br.gov.seplag.artistalbum.application.io.AlbumRequest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


public final class ArtistIdExtractor {

    private ArtistIdExtractor() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }


    public static List<Long> extractArtistIds(AlbumRequest request) {
        if (request == null) {
            return Collections.emptyList();
        }

        List<Long> artistIds = new ArrayList<>();

        if (request.artistIds() != null && !request.artistIds().isEmpty()) {
            artistIds.addAll(request.artistIds());
        }
        else if (request.artistId() != null) {
            artistIds.add(request.artistId());
        }

        return artistIds;
    }


    public static void validateArtistIds(AlbumRequest request) {
        List<Long> artistIds = extractArtistIds(request);
        if (artistIds.isEmpty()) {
            throw new IllegalArgumentException("At least one artist must be provided (use artistId or artistIds)");
        }
    }
}
