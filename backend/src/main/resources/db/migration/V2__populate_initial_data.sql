-- V2__populate_initial_data.sql
-- Insert default user (password: admin123)
-- BCrypt hash of 'admin123': $2a$10$cQPt4UkZ9oJbwGW0BleDd.b/Rfh8Mf6IKD7Jg5mUwcW7Tx.3Tf7d6
INSERT INTO users (username, password, email, full_name, enabled, created_at, updated_at)
VALUES ('admin', '$2a$10$cQPt4UkZ9oJbwGW0BleDd.b/Rfh8Mf6IKD7Jg5mUwcW7Tx.3Tf7d6', 'admin@seplag.gov.br', 'Administrador', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert artists
INSERT INTO artists (name, created_at, updated_at) VALUES
('Serj Tankian', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mike Shinoda', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Michel Teló', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Guns N'' Roses', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert albums for Serj Tankian (id = 1)
INSERT INTO albums (title, release_year, artist_id, created_at, updated_at) VALUES
('Harakiri', 2012, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Black Blooms', 2024, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Rough Dog', 2023, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert albums for Mike Shinoda (id = 2)
INSERT INTO albums (title, release_year, artist_id, created_at, updated_at) VALUES
('The Rising Tied', 2005, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Post Traumatic', 2018, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Post Traumatic EP', 2018, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Where''d You Go', 2006, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert albums for Michel Teló (id = 3)
INSERT INTO albums (title, release_year, artist_id, created_at, updated_at) VALUES
('Bem Sertanejo', 2011, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bem Sertanejo - O Show (Ao Vivo)', 2011, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bem Sertanejo - (1ª Temporada) - EP', 2011, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert albums for Guns N' Roses (id = 4)
INSERT INTO albums (title, release_year, artist_id, created_at, updated_at) VALUES
('Use Your Illusion I', 1991, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Use Your Illusion II', 1991, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Greatest Hits', 2004, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
