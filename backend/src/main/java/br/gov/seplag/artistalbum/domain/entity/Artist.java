package br.gov.seplag.artistalbum.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "artists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "artist_type", length = 100)
    private String artistType;

    @Column(length = 100)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @ManyToMany(mappedBy = "artists", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Album> albums = new ArrayList<>();

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
     * Business method to add album
     */
    public void addAlbum(Album album) {
        if (!albums.contains(album)) {
            albums.add(album);
            album.getArtists().add(this);
        }
    }

    /**
     * Business method to remove album
     */
    public void removeAlbum(Album album) {
        if (albums.contains(album)) {
            albums.remove(album);
            album.getArtists().remove(this);
        }
    }

    /**
     * Business method to get album count
     */
    public int getAlbumCount() {
        return albums != null ? albums.size() : 0;
    }
}
