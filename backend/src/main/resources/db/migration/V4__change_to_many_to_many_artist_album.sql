-- V4__change_to_many_to_many_artist_album.sql
-- Migração para converter relacionamento 1:N em N:N entre Artist e Album

-- 1. Criar tabela de junção artist_album
CREATE TABLE artist_album (
    id BIGSERIAL PRIMARY KEY,
    artist_id BIGINT NOT NULL,
    album_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_artist_album_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    CONSTRAINT fk_artist_album_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    CONSTRAINT uk_artist_album UNIQUE (artist_id, album_id)
);

-- 2. Migrar dados existentes da tabela albums para artist_album
INSERT INTO artist_album (artist_id, album_id, created_at)
SELECT artist_id, id, CURRENT_TIMESTAMP
FROM albums
WHERE artist_id IS NOT NULL;

-- 3. Remover a constraint de chave estrangeira da tabela albums
ALTER TABLE albums DROP CONSTRAINT IF EXISTS fk_artist;

-- 4. Remover a coluna artist_id da tabela albums (não é mais necessária com N:N)
-- NOTA: Removemos a NOT NULL primeiro, depois a coluna
ALTER TABLE albums ALTER COLUMN artist_id DROP NOT NULL;
ALTER TABLE albums DROP COLUMN artist_id;

-- 5. Criar índices para melhor performance
CREATE INDEX idx_artist_album_artist_id ON artist_album(artist_id);
CREATE INDEX idx_artist_album_album_id ON artist_album(album_id);

-- 6. Comentários para documentação
COMMENT ON TABLE artist_album IS 'Tabela de relacionamento N:N entre artistas e álbuns';
COMMENT ON COLUMN artist_album.artist_id IS 'ID do artista';
COMMENT ON COLUMN artist_album.album_id IS 'ID do álbum';
COMMENT ON COLUMN artist_album.created_at IS 'Data de criação da associação';
