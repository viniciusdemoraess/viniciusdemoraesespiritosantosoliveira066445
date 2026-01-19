package br.gov.seplag.artistalbum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ArtistAlbumApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ArtistAlbumApiApplication.class, args);
    }
}
