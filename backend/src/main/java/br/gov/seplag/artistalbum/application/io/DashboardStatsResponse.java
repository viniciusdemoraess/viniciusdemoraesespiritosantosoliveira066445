package br.gov.seplag.artistalbum.application.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalArtists;
    private Long totalAlbums;
    private Double averageAlbumsPerArtist;
    private Long artistsWithoutAlbums;
    private Long albumsWithCovers;
    private Long albumsWithoutCovers;
    private List<RecentAlbumDto> recentAlbums;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentAlbumDto {
        private Long id;
        private String title;
        private String artistNames;
        private Integer releaseYear;
        private Integer totalTracks;
        private String genre;
    }
}
