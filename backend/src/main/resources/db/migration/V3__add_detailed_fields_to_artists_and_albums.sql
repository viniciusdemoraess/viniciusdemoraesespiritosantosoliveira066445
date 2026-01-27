-- V3__add_detailed_fields_to_artists_and_albums.sql
-- Add detailed fields to artists table
ALTER TABLE artists 
ADD COLUMN artist_type VARCHAR(100),
ADD COLUMN country VARCHAR(100),
ADD COLUMN biography TEXT;

-- Add detailed fields to albums table
ALTER TABLE albums
ADD COLUMN genre VARCHAR(100),
ADD COLUMN record_label VARCHAR(200),
ADD COLUMN total_tracks INTEGER,
ADD COLUMN total_duration_seconds INTEGER;

-- Add comments to artists table
COMMENT ON TABLE artists IS 'Tabela de artistas musicais';
COMMENT ON COLUMN artists.id IS 'Identificador único do artista';
COMMENT ON COLUMN artists.name IS 'Nome do artista (obrigatório, 2-200 caracteres)';
COMMENT ON COLUMN artists.artist_type IS 'Tipo do artista (ex: Cantor, Banda, DJ, Compositor)';
COMMENT ON COLUMN artists.country IS 'País de origem do artista';
COMMENT ON COLUMN artists.biography IS 'Biografia completa do artista';
COMMENT ON COLUMN artists.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN artists.updated_at IS 'Data e hora da última atualização';

-- Add comments to albums table
COMMENT ON TABLE albums IS 'Tabela de álbuns musicais';
COMMENT ON COLUMN albums.id IS 'Identificador único do álbum';
COMMENT ON COLUMN albums.title IS 'Título do álbum (obrigatório, 3-200 caracteres)';
COMMENT ON COLUMN albums.release_year IS 'Ano de lançamento do álbum';
COMMENT ON COLUMN albums.genre IS 'Gênero musical do álbum (ex: Rock, Pop, Sertanejo)';
COMMENT ON COLUMN albums.record_label IS 'Gravadora responsável pelo álbum';
COMMENT ON COLUMN albums.total_tracks IS 'Número total de faixas no álbum';
COMMENT ON COLUMN albums.total_duration_seconds IS 'Duração total do álbum em segundos';
COMMENT ON COLUMN albums.artist_id IS 'ID do artista (chave estrangeira)';
COMMENT ON COLUMN albums.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN albums.updated_at IS 'Data e hora da última atualização';

-- Add comments to album_covers table
COMMENT ON TABLE album_covers IS 'Tabela de capas de álbuns (suporte a múltiplas capas por álbum)';
COMMENT ON COLUMN album_covers.id IS 'Identificador único da capa';
COMMENT ON COLUMN album_covers.file_name IS 'Nome do arquivo da capa';
COMMENT ON COLUMN album_covers.object_key IS 'Chave única do objeto no storage (MinIO/S3)';
COMMENT ON COLUMN album_covers.content_type IS 'Tipo MIME do arquivo (ex: image/jpeg, image/png)';
COMMENT ON COLUMN album_covers.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN album_covers.album_id IS 'ID do álbum (chave estrangeira)';
COMMENT ON COLUMN album_covers.created_at IS 'Data e hora do upload da capa';

-- Add comments to users table
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN users.id IS 'Identificador único do usuário';
COMMENT ON COLUMN users.username IS 'Nome de usuário (único, obrigatório)';
COMMENT ON COLUMN users.password IS 'Senha criptografada (BCrypt)';
COMMENT ON COLUMN users.email IS 'Endereço de email do usuário';
COMMENT ON COLUMN users.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.enabled IS 'Indica se o usuário está ativo';
COMMENT ON COLUMN users.created_at IS 'Data e hora de criação do usuário';
COMMENT ON COLUMN users.updated_at IS 'Data e hora da última atualização';

-- Add comments to regionais table
COMMENT ON TABLE regionais IS 'Tabela de regionais (integração com API externa)';
COMMENT ON COLUMN regionais.id IS 'Identificador único interno';
COMMENT ON COLUMN regionais.external_id IS 'ID externo da regional na API';
COMMENT ON COLUMN regionais.nome IS 'Nome da regional';
COMMENT ON COLUMN regionais.ativo IS 'Indica se a regional está ativa';
COMMENT ON COLUMN regionais.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN regionais.updated_at IS 'Data e hora da última atualização';

-- Create indexes for new fields
CREATE INDEX idx_artists_country ON artists(country);
CREATE INDEX idx_artists_type ON artists(artist_type);
CREATE INDEX idx_albums_genre ON albums(genre);
CREATE INDEX idx_albums_record_label ON albums(record_label);
