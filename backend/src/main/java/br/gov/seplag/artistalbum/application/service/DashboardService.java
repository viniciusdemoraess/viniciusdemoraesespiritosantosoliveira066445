package br.gov.seplag.artistalbum.application.service;

import br.gov.seplag.artistalbum.application.io.DashboardStatsResponse;
import br.gov.seplag.artistalbum.domain.entity.Album;
import br.gov.seplag.artistalbum.domain.repository.AlbumRepository;
import br.gov.seplag.artistalbum.domain.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;


    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        log.debug("Fetching dashboard statistics");

        long totalArtists = artistRepository.count();
        long totalAlbums = albumRepository.count();
        
        double averageAlbumsPerArtist = totalArtists > 0 
            ? (double) totalAlbums / totalArtists 
            : 0.0;

        long artistsWithoutAlbums = artistRepository.countArtistsWithoutAlbums();

        long albumsWithCovers = albumRepository.countAlbumsWithCovers();
        long albumsWithoutCovers = totalAlbums - albumsWithCovers;

        List<Album> recentAlbumEntities = albumRepository.findAll(
            PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "releaseYear", "createdAt"))
        ).getContent();

        List<DashboardStatsResponse.RecentAlbumDto> recentAlbums = recentAlbumEntities.stream()
            .map(album -> DashboardStatsResponse.RecentAlbumDto.builder()
                .id(album.getId())
                .title(album.getTitle())
                .artistNames(album.getArtistNames())
                .releaseYear(album.getReleaseYear())
                .totalTracks(album.getTotalTracks())
                .genre(album.getGenre())
                .build())
            .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
            .totalArtists(totalArtists)
            .totalAlbums(totalAlbums)
            .averageAlbumsPerArtist(Math.round(averageAlbumsPerArtist * 10.0) / 10.0)
            .artistsWithoutAlbums(artistsWithoutAlbums)
            .albumsWithCovers(albumsWithCovers)
            .albumsWithoutCovers(albumsWithoutCovers)
            .recentAlbums(recentAlbums)
            .build();
    }
}
