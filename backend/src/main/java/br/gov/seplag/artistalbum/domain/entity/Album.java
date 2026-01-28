package br.gov.seplag.artistalbum.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "albums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(length = 100)
    private String genre;

    @Column(name = "record_label", length = 200)
    private String recordLabel;

    @Column(name = "total_tracks")
    private Integer totalTracks;

    @Column(name = "total_duration_seconds")
    private Integer totalDurationSeconds;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "artist_album",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "artist_id")
    )
    @Builder.Default
    private List<Artist> artists = new ArrayList<>();

    @OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AlbumCover> covers = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Business method to add cover
     */
    public void addCover(AlbumCover cover) {
        covers.add(cover);
        cover.setAlbum(this);
    }

    /**
     * Business method to remove cover
     */
    public void removeCover(AlbumCover cover) {
        covers.remove(cover);
        cover.setAlbum(null);
    }

    /**
     * Business method to add artist
     */
    public void addArtist(Artist artist) {
        if (!artists.contains(artist)) {
            artists.add(artist);
            artist.getAlbums().add(this);
        }
    }

    /**
     * Business method to remove artist
     */
    public void removeArtist(Artist artist) {
        if (artists.contains(artist)) {
            artists.remove(artist);
            artist.getAlbums().remove(this);
        }
    }

    /**
     * Business method to get artist names
     */
    public String getArtistNames() {
        return artists.stream()
            .map(Artist::getName)
            .reduce((a, b) -> a + ", " + b)
            .orElse("");
    }
}
