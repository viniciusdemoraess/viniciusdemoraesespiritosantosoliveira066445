-- V5__populate_enhanced_data.sql
-- Popula o banco com dados completos e realistas de artistas e álbuns

-- Limpar dados existentes (exceto usuário)
DELETE FROM artist_album;
DELETE FROM album_covers;
DELETE FROM albums;
DELETE FROM artists;

-- Reset sequences
ALTER SEQUENCE artists_id_seq RESTART WITH 1;
ALTER SEQUENCE albums_id_seq RESTART WITH 1;
ALTER SEQUENCE artist_album_id_seq RESTART WITH 1;

-- ============================================
-- INSERIR ARTISTAS COM INFORMAÇÕES COMPLETAS
-- ============================================

INSERT INTO artists (name, artist_type, country, biography, created_at, updated_at) VALUES
-- Rock Internacional
('The Beatles', 'Band', 'United Kingdom', 'The Beatles were an English rock band formed in Liverpool in 1960. The group, whose best-known line-up comprised John Lennon, Paul McCartney, George Harrison and Ringo Starr, are regarded as the most influential band of all time.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pink Floyd', 'Band', 'United Kingdom', 'Pink Floyd are an English rock band formed in London in 1965. Gaining an early following as one of the first British psychedelic groups, they were distinguished by their philosophical lyrics, sonic experimentation, and elaborate live shows.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Queen', 'Band', 'United Kingdom', 'Queen are a British rock band formed in London in 1970. Their classic line-up was Freddie Mercury, Brian May, Roger Taylor and John Deacon. Queen are considered one of the greatest rock bands of all time.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Rock Brasileiro
('Legião Urbana', 'Band', 'Brazil', 'Legião Urbana foi uma banda de rock brasileira formada em 1982, em Brasília, por Renato Russo, Dado Villa-Lobos, Renato Rocha e Marcelo Bonfá. É considerada uma das bandas mais influentes do rock brasileiro.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- MPB e Sertanejo
('Caetano Veloso', 'Solo Artist', 'Brazil', 'Caetano Emanuel Viana Teles Veloso é um músico, produtor, arranjador e escritor brasileiro. Um dos criadores do movimento tropicalista, é considerado um dos maiores nomes da MPB.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Gilberto Gil', 'Solo Artist', 'Brazil', 'Gilberto Passos Gil Moreira é um cantor, compositor, multi-instrumentista, produtor musical e político brasileiro, conhecido por sua contribuição fundamental para a música brasileira e o movimento tropicalista.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Chitãozinho & Xororó', 'Duo', 'Brazil', 'Chitãozinho & Xororó é uma dupla sertaneja brasileira formada pelos irmãos José Lima Sobrinho (Chitãozinho) e Durval de Lima (Xororó). A dupla é considerada uma das mais importantes da música sertaneja.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Hip Hop e Pop
('Eminem', 'Solo Artist', 'United States', 'Marshall Bruce Mathers III, known professionally as Eminem, is an American rapper, songwriter, and record producer. He is regarded as one of the greatest and most influential artists in hip hop history.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Taylor Swift', 'Solo Artist', 'United States', 'Taylor Alison Swift is an American singer-songwriter. Known for her autobiographical songwriting and artistic reinventions, Swift is one of the best-selling music artists of all time.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- INSERIR ÁLBUNS COM INFORMAÇÕES COMPLETAS
-- ============================================

INSERT INTO albums (title, release_year, genre, record_label, total_tracks, total_duration_seconds, created_at, updated_at) VALUES
-- The Beatles (id = 1)
('Abbey Road', 1969, 'Rock', 'Apple Records', 17, 2832, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sgt. Pepper''s Lonely Hearts Club Band', 1967, 'Psychedelic Rock', 'Parlophone', 13, 2389, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Beatles (White Album)', 1968, 'Rock', 'Apple Records', 30, 5625, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Pink Floyd (id = 2)
('The Dark Side of the Moon', 1973, 'Progressive Rock', 'Harvest Records', 10, 2588, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Wall', 1979, 'Progressive Rock', 'Harvest Records', 26, 4881, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Wish You Were Here', 1975, 'Progressive Rock', 'Harvest Records', 5, 2642, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Queen (id = 3)
('A Night at the Opera', 1975, 'Rock', 'EMI', 12, 2525, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bohemian Rhapsody (Single)', 1975, 'Rock', 'EMI', 1, 354, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('News of the World', 1977, 'Rock', 'EMI', 11, 2209, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Legião Urbana (id = 4)
('Dois', 1986, 'Rock Brasileiro', 'EMI', 12, 2520, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Que País é Este', 1987, 'Rock Brasileiro', 'EMI', 10, 2280, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('As Quatro Estações', 1989, 'Rock Brasileiro', 'EMI', 13, 2640, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('V', 1991, 'Rock Brasileiro', 'EMI', 12, 2700, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Caetano Veloso (id = 5)
('Tropicália', 1968, 'Tropicália', 'Philips Records', 12, 2160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Caetano Veloso (1968)', 1968, 'MPB', 'Philips Records', 10, 1980, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Circuladô', 1991, 'MPB', 'PolyGram', 13, 2520, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Gilberto Gil (id = 6)
('Expresso 2222', 1972, 'MPB', 'Philips Records', 10, 2280, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Refazenda', 1975, 'MPB', 'Philips Records', 11, 2400, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Realce', 1979, 'MPB', 'WEA', 12, 2640, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Chitãozinho & Xororó (id = 7)
('Clássicos Sertanejos', 1990, 'Sertanejo', 'PolyGram', 14, 2520, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('50 Anos de Sucesso', 2020, 'Sertanejo', 'Som Livre', 30, 5400, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Evidências', 1990, 'Sertanejo', 'PolyGram', 12, 2160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Eminem (id = 8)
('The Marshall Mathers LP', 2000, 'Hip Hop', 'Aftermath/Interscope', 18, 4320, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Eminem Show', 2002, 'Hip Hop', 'Aftermath/Interscope', 20, 4620, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Recovery', 2010, 'Hip Hop', 'Aftermath/Interscope', 17, 4680, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Taylor Swift (id = 9)
('1989', 2014, 'Pop', 'Big Machine Records', 13, 2880, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Reputation', 2017, 'Pop', 'Big Machine Records', 15, 3300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Folklore', 2020, 'Indie Folk', 'Republic Records', 16, 3780, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Midnights', 2022, 'Pop', 'Republic Records', 13, 2640, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- CRIAR RELACIONAMENTOS N:N (artist_album)
-- ============================================

-- The Beatles - álbuns 1 a 3
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(1, 1, CURRENT_TIMESTAMP), (1, 2, CURRENT_TIMESTAMP), (1, 3, CURRENT_TIMESTAMP);

-- Pink Floyd - álbuns 4 a 6
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(2, 4, CURRENT_TIMESTAMP), (2, 5, CURRENT_TIMESTAMP), (2, 6, CURRENT_TIMESTAMP);

-- Queen - álbuns 7 a 9
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(3, 7, CURRENT_TIMESTAMP), (3, 8, CURRENT_TIMESTAMP), (3, 9, CURRENT_TIMESTAMP);

-- Legião Urbana - álbuns 10 a 13
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(4, 10, CURRENT_TIMESTAMP), (4, 11, CURRENT_TIMESTAMP), (4, 12, CURRENT_TIMESTAMP), (4, 13, CURRENT_TIMESTAMP);

-- Caetano Veloso - álbuns 14 a 16
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(5, 14, CURRENT_TIMESTAMP), (5, 15, CURRENT_TIMESTAMP), (5, 16, CURRENT_TIMESTAMP);

-- Gilberto Gil - álbuns 17 a 19
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(6, 17, CURRENT_TIMESTAMP), (6, 18, CURRENT_TIMESTAMP), (6, 19, CURRENT_TIMESTAMP);

-- Gilberto Gil também participou do Tropicália com Caetano (álbum 14)
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(6, 14, CURRENT_TIMESTAMP);

-- Chitãozinho & Xororó - álbuns 20 a 22
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(7, 20, CURRENT_TIMESTAMP), (7, 21, CURRENT_TIMESTAMP), (7, 22, CURRENT_TIMESTAMP);

-- Eminem - álbuns 23 a 25
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(8, 23, CURRENT_TIMESTAMP), (8, 24, CURRENT_TIMESTAMP), (8, 25, CURRENT_TIMESTAMP);

-- Taylor Swift - álbuns 26 a 29
INSERT INTO artist_album (artist_id, album_id, created_at) VALUES
(9, 26, CURRENT_TIMESTAMP), (9, 27, CURRENT_TIMESTAMP), (9, 28, CURRENT_TIMESTAMP), (9, 29, CURRENT_TIMESTAMP);
