package br.gov.seplag.artistalbum.application.io;

import lombok.Builder;

import java.util.List;

@Builder
public record DashboardStatsResponse(
    Long totalArtists,
    Long totalAlbums,
    Double averageAlbumsPerArtist,
    Long artistsWithoutAlbums,
    Long albumsWithCovers,
    Long albumsWithoutCovers,
    List<RecentAlbumDto> recentAlbums
) {
    @Builder
    public record RecentAlbumDto(
        Long id,
        String title,
        String artistNames,
        Integer releaseYear,
        Integer totalTracks,
        String genre
    ) {}
}
