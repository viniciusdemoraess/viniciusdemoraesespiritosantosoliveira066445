# 🎵 Artist & Album Management System

## 📋 Projeto Full Stack - SEPLAG

Sistema completo de gerenciamento de artistas e álbuns desenvolvido com **Spring Boot** e **Angular**, incluindo autenticação JWT, armazenamento de imagens em MinIO (S3), notificações em tempo real via WebSocket, rate limiting e integração com API externa.

---

## 👨‍💻 Dados do Candidato

**Nome:** Vinicius de Moraes
**Vaga:** Engenheiro da Computação Sênior  
**Email:** viniciusdemoraespro@gmail.com  
**Data de Entrega:** Janeiro/2026

---

## 🎯 Requisitos Implementados

### ✅ Backend (Spring Boot 3.2)

- [x] **Autenticação JWT** com expiração de 5 minutos e renovação de token
- [x] **CORS** configurado para domínio específico
- [x] **CRUD completo** de Artistas e Álbuns (POST, PUT, GET)
- [x] **Paginação** em todas as listagens
- [x] **Consultas parametrizadas** com filtros e ordenação (ASC/DESC)
- [x] **Upload múltiplo de imagens** para capas de álbuns
- [x] **MinIO (S3)** para armazenamento de arquivos
- [x] **Presigned URLs** com expiração de 30 minutos
- [x] **Versionamento de API** (/api/v1)
- [x] **Flyway Migrations** para criação e população de tabelas
- [x] **OpenAPI/Swagger** para documentação interativa

### ✅ Requisitos Sênior

- [x] **Health Checks** (Liveness/Readiness) para Kubernetes/Docker
- [x] **Testes Unitários** com JUnit 5, Mockito e AssertJ
- [x] **WebSocket** para notificações em tempo real de novos álbuns
- [x] **Rate Limiting** - máximo 10 requisições/minuto por usuário (Bucket4j)
- [x] **Integração com API externa** de Regionais da Polícia Civil
- [x] **Sincronização inteligente** com complexidade O(n):
  - Novo no endpoint → Inserir localmente
  - Removido do endpoint → Inativar localmente
  - Atributo alterado → Inativar anterior e criar novo

### ✅ Arquitetura & Boas Práticas

- [x] **Clean Architecture** (Domain, Application, Infrastructure, Presentation)
- [x] **Domain-Driven Design** (Entidades com lógica de negócio)
- [x] **SOLID Principles**
- [x] **Repository Pattern**
- [x] **DTO Pattern** com validações
- [x] **Global Exception Handler**
- [x] **Injeção de dependência por construtor**
- [x] **Lombok** para redução de boilerplate
- [x] **MapStruct** para mapeamento de objetos

---

## 📊 Modelagem de Dados

### Decisões Arquiteturais

#### 1. **Tabela `artists`**
```sql
id (BIGSERIAL PRIMARY KEY)
name (VARCHAR(200) NOT NULL) -- Nome do artista/banda
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Justificativa:** Separação de artistas permite reuso e facilita queries. Índice no campo `name` para buscas rápidas.

#### 2. **Tabela `albums`**
```sql
id (BIGSERIAL PRIMARY KEY)
title (VARCHAR(200) NOT NULL)
release_year (INTEGER) -- Ano de lançamento
artist_id (BIGINT FK) -- Relacionamento com artista
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Justificativa:** Relacionamento 1:N com artistas. Cascade delete para manter integridade.

#### 3. **Tabela `album_covers`**
```sql
id (BIGSERIAL PRIMARY KEY)
file_name (VARCHAR(255))
object_key (VARCHAR(500) UNIQUE) -- Chave no MinIO
content_type (VARCHAR(100))
file_size (BIGINT)
album_id (BIGINT FK)
created_at (TIMESTAMP)
```
**Justificativa:** Separação permite múltiplas capas por álbum. `object_key` é único para evitar duplicação no MinIO.

#### 4. **Tabela `regionais`**
```sql
id (BIGSERIAL PRIMARY KEY)
external_id (INTEGER UNIQUE) -- ID da API externa
nome (VARCHAR(200))
ativo (BOOLEAN DEFAULT TRUE)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Justificativa:** Campo `ativo` permite soft delete. `external_id` para rastreamento da fonte.

#### 5. **Tabela `users`**
```sql
id (BIGSERIAL PRIMARY KEY)
username (VARCHAR(255) UNIQUE)
password (VARCHAR(255)) -- BCrypt hash
email (VARCHAR(255))
full_name (VARCHAR(255))
enabled (BOOLEAN DEFAULT TRUE)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Justificativa:** Implementa `UserDetails` do Spring Security. Senha com BCrypt.

---

## 🏗️ Arquitetura do Sistema

### Camadas da Aplicação

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Controllers)     │ ← REST APIs + WebSocket
├─────────────────────────────────────────┤
│   Application Layer (Services + DTOs)   │ ← Lógica de aplicação
├─────────────────────────────────────────┤
│       Domain Layer (Entities)            │ ← Lógica de negócio
├─────────────────────────────────────────┤
│  Infrastructure (Security, Storage, WS)  │ ← Crosscutting concerns
└─────────────────────────────────────────┘
```

### Fluxo de Autenticação JWT

```
Cliente                    API                  Database
  │                         │                      │
  ├──POST /api/v1/auth/login─>│                      │
  │    {username, password}  │                      │
  │                         │──Query User────────>│
  │                         │<───User Entity──────│
  │                         │                      │
  │                         │ (Validate & Generate JWT)
  │<──{accessToken, refresh}│                      │
  │                         │                      │
  ├──GET /api/v1/artists───>│                      │
  │   Header: Bearer token  │                      │
  │                         │ (Validate JWT)       │
  │                         │──Query Artists─────>│
  │<──[Artists List]────────│<───[Results]────────│
```

### Fluxo de Upload de Imagens

```
Cliente           API              MinIO
  │                │                 │
  ├──POST /albums/1/covers──>│                 │
  │   [files]      │                 │
  │                │──PutObject────>│
  │                │<──ObjectKey─────│
  │                │ (Save metadata) │
  │                │──Generate URL──>│
  │<──[URLs]───────│<──Presigned URL─│
```

### WebSocket Notification Flow

```
Client A    Client B    API         WebSocket Broker
   │           │         │                │
   ├───────────┴─────CONNECT /ws────────>│
   │           │         │                │
   │           │    POST /albums          │
   │           │         │                │
   │           │         ├─notifyNewAlbum─>│
   │<──────────┴─────────┴─/topic/albums──│
   │  {type: 'NEW_ALBUM', albumTitle...}  │
```

---

## 🚀 Como Executar

### Pré-requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Java** 17+ (para desenvolvimento local)
- **Maven** 3.8+ (para desenvolvimento local)
- **Node.js** 18+ e **Angular CLI** 17+ (para frontend)

### 🐳 Execução com Docker Compose (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/viniciusdemoraess/viniciusdemoraesespiritosantosoliveira066445.git
cd viniciusdemoraesespiritosantosoliveira066445

# 2. Inicie todos os serviços
docker-compose up -d

# 3. Acompanhe os logs
docker-compose logs -f api

# Aguarde até ver: "Started ArtistAlbumApiApplication"
```

**Serviços disponíveis:**
- 🌐 **API Backend:** http://localhost:8080
- 📚 **Swagger UI:** http://localhost:8080/swagger-ui.html
- 🎨 **Frontend:** http://localhost:4200
- 🗄️ **PostgreSQL:** localhost:5432
- 📦 **MinIO Console:** http://localhost:9001 (minioadmin/minioadmin)
- ❤️ **Health Check:** http://localhost:8080/actuator/health

### 💻 Execução Local (Desenvolvimento)

#### Backend

```bash
cd backend

# Inicie PostgreSQL e MinIO
docker-compose up -d postgres minio

# Execute a aplicação
./mvnw spring-boot:run

# Ou compile e execute o JAR
./mvnw clean package
java -jar target/artist-album-api-1.0.0.jar
```

#### Frontend

```bash
cd frontend

# Instale dependências
npm install

# Inicie em modo desenvolvimento
ng serve

# Acesse: http://localhost:4200
```

### 🧪 Executar Testes

```bash
cd backend

# Executar todos os testes
./mvnw test

# Executar com relatório de cobertura
./mvnw test jacoco:report

# Ver relatório: target/site/jacoco/index.html
```

---

## 📖 Documentação da API

### Swagger/OpenAPI

Acesse a documentação interativa em: **http://localhost:8080/swagger-ui.html**

### Endpoints Principais

#### 🔐 Autenticação

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 300,
  "username": "admin"
}
```

```http
POST /api/v1/auth/refresh?refreshToken=<token>

Response 200: (novo access token)
```

#### 🎤 Artistas

```http
# Listar todos (com paginação e filtros)
GET /api/v1/artists?page=0&size=10&sortBy=name&sortDirection=asc&name=Serj
Authorization: Bearer <token>

# Buscar por ID
GET /api/v1/artists/1
Authorization: Bearer <token>

# Criar artista
POST /api/v1/artists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pink Floyd"
}

# Atualizar artista
PUT /api/v1/artists/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pink Floyd Updated"
}

# Deletar artista
DELETE /api/v1/artists/1
Authorization: Bearer <token>
```

#### 💿 Álbuns

```http
# Listar todos (com filtros)
GET /api/v1/albums?page=0&size=10&artistId=1&title=Harakiri
Authorization: Bearer <token>

# Buscar por ID
GET /api/v1/albums/1
Authorization: Bearer <token>

# Criar álbum
POST /api/v1/albums
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "The Dark Side of the Moon",
  "releaseYear": 1973,
  "artistId": 1
}

# Upload de capas
POST /api/v1/albums/1/covers
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [cover1.jpg, cover2.png]
```

#### 🗺️ Regionais

```http
# Sincronizar com API externa
POST /api/v1/regionais/sync
Authorization: Bearer <token>

# Listar todas
GET /api/v1/regionais
Authorization: Bearer <token>

# Listar apenas ativas
GET /api/v1/regionais/active
Authorization: Bearer <token>
```

### Rate Limiting

Todas as requisições autenticadas são limitadas a **10 req/min** por usuário.

**Headers de resposta:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
```

**Erro 429:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Maximum 10 requests per minute allowed."
}
```

---

## 🔌 WebSocket

### Conectar ao WebSocket

```javascript
// Cliente JavaScript/TypeScript
import * as SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
  console.log('Connected:', frame);
  
  // Subscrever ao tópico de álbuns
  stompClient.subscribe('/topic/albums', (message) => {
    const notification = JSON.parse(message.body);
    console.log('New album:', notification);
    
    // {
    //   type: "NEW_ALBUM",
    //   albumId: 15,
    //   albumTitle: "New Album",
    //   artistId: 1,
    //   artistName: "Serj Tankian",
    //   message: "New album 'New Album' by Serj Tankian has been added!",
    //   timestamp: "2026-01-14T10:30:00"
    // }
  });
});
```

---

## 🧪 Testes

### Cobertura de Testes

- ✅ **ArtistServiceTest** - Testes de serviço de artistas
- ✅ **JwtTokenProviderTest** - Testes de geração e validação JWT
- ✅ **RateLimitServiceTest** - Testes de rate limiting

### Executar e Ver Cobertura

```bash
./mvnw clean test jacoco:report
open target/site/jacoco/index.html
```

### Exemplo de Teste

```java
@Test
@DisplayName("Should create artist successfully")
void shouldCreateArtistSuccessfully() {
    // Arrange
    when(artistRepository.existsByNameIgnoreCase(anyString())).thenReturn(false);
    when(artistRepository.save(any(Artist.class))).thenReturn(testArtist);

    // Act
    ArtistResponse response = artistService.createArtist(artistRequest);

    // Assert
    assertThat(response).isNotNull();
    assertThat(response.getName()).isEqualTo("Serj Tankian");
    verify(artistRepository, times(1)).save(any(Artist.class));
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artistdb
DB_USER=postgres
DB_PASSWORD=postgres

# MinIO
MINIO_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=album-covers

# JWT
JWT_SECRET=your-super-secret-key-minimum-256-bits
JWT_EXPIRATION=300000  # 5 minutes
JWT_REFRESH_EXPIRATION=86400000  # 24 hours

# CORS
ALLOWED_ORIGINS=http://localhost:4200

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=10

# External API
EXTERNAL_REGIONAIS_API_URL=https://integrador-argus-api.geia.vip/v1/regionais
```

---

## 📦 Estrutura do Projeto

```
projeto-seplag/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/br/gov/seplag/artistalbum/
│   │   │   │   ├── ArtistAlbumApiApplication.java
│   │   │   │   ├── application/
│   │   │   │   │   ├── dto/           # DTOs e validações
│   │   │   │   │   └── service/       # Lógica de aplicação
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entity/        # Entidades JPA
│   │   │   │   │   └── repository/    # Repositories
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── config/        # Configurações
│   │   │   │   │   ├── security/      # JWT, Security
│   │   │   │   │   ├── storage/       # MinIO
│   │   │   │   │   ├── websocket/     # WebSocket
│   │   │   │   │   ├── ratelimit/     # Rate limiting
│   │   │   │   │   └── exception/     # Exception handlers
│   │   │   │   └── presentation/
│   │   │   │       └── controller/    # REST Controllers
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/      # Flyway migrations
│   │   └── test/                      # Testes unitários
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                          # (A ser implementado)
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🎨 Frontend

O frontend foi desenvolvido em **Angular 17+** com:

- ✅ **TypeScript** strict mode
- ✅ **Tailwind CSS** para estilização
- ✅ **Lazy Loading** de rotas
- ✅ **Padrão Facade** para serviços
- ✅ **BehaviorSubject** para gestão de estado
- ✅ **Guards** para proteção de rotas
- ✅ **Interceptors** para JWT
- ✅ **WebSocket client** para notificações
- ✅ **Responsividade** mobile-first

### Estrutura

```
frontend/src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/
│   │   ├── components/
│   │   └── models/
│   ├── features/
│   │   ├── auth/
│   │   ├── artists/
│   │   └── albums/
│   └── facades/
├── assets/
└── environments/
```

---

## ✅ Status de Implementação

### Backend - 100% Completo ✅

- [x] Estrutura base do projeto
- [x] Entidades e repositórios
- [x] Flyway migrations
- [x] Autenticação JWT
- [x] CRUD de Artistas
- [x] CRUD de Álbuns
- [x] Upload MinIO
- [x] Health Checks
- [x] WebSocket
- [x] Rate Limiting
- [x] API Externa + Sincronização
- [x] Testes unitários
- [x] OpenAPI/Swagger
- [x] Docker + Docker Compose
- [x] Global Exception Handler

### Frontend - 100% Completo ✅

- [x] Setup Angular
- [x] Autenticação
- [x] Listagem de artistas
- [x] Detalhes do artista
- [x] Cadastro/Edição
- [x] Upload de imagens
- [x] WebSocket client
- [x] Gestão de estado

---

## 🚧 Dificuldades e Soluções

### 1. **Rate Limiting por Usuário**
**Desafio:** Implementar rate limiting eficiente sem banco de dados.  
**Solução:** Utilização do Bucket4j com algoritmo Token Bucket e ConcurrentHashMap para armazenamento em memória. Filtro aplicado após autenticação para identificar usuário.

### 2. **Sincronização com API Externa**
**Desafio:** Alcançar complexidade O(n) e detectar alterações de nome.  
**Solução:** Uso de HashMaps para lookups O(1), comparação de nomes para detectar mudanças, soft delete com campo `ativo`.

### 3. **Presigned URLs do MinIO**
**Desafio:** URLs temporárias com expiração.  
**Solução:** Geração de presigned URLs no momento da consulta com TTL de 30 minutos.

### 4. **WebSocket + Security**
**Desafio:** Integrar WebSocket com Spring Security.  
**Solução:** Endpoint `/ws` configurado como público, validação de usuário feita por token JWT no header das requisições subsequentes.

---

## 🔒 Segurança

### Implementações

1. **JWT com expiração curta** (5 min) + refresh token (24h)
2. **BCrypt** para hash de senhas
3. **CORS** restrito a origens específicas
4. **Rate Limiting** por usuário autenticado
5. **Validação de entrada** com Bean Validation
6. **Exception handling** sem expor stack traces
7. **Health checks** sem informações sensíveis
8. **Docker** com usuário non-root

---

## 📈 Melhorias Futuras

1. **Cache com Redis** para otimizar consultas frequentes
2. **Elastic search** para busca avançada
3. **Observabilidade** com Prometheus + Grafana
4. **CI/CD** com GitHub Actions
5. **Kubernetes** deployment com Helm charts
6. **Testes de integração** com Testcontainers
7. **Auditoria** de operações críticas
8. **Multi-tenancy** para suportar múltiplas organizações

---

## 📝 Licença

Este projeto foi desenvolvido como parte de um processo seletivo para SEPLAG.

---

## 👤 Autor

**Desenvolvido por:** Vinicius de Moraes Espirito Santos Oliveira
**GitHub:** [viniciusdemoraess](https://github.com/viniciusdemoraess)  
**LinkedIn:** [Vinicius de Moraes](https://www.linkedin.com/in/vinicius-de-moraes-781880185)  
**Email:** viniciusdemoraespro@gmail.com

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `docker-compose logs -f api`
2. Verifique o health check: `curl http://localhost:8080/actuator/health`
3. Acesse o Swagger: http://localhost:8080/swagger-ui.html
4. Entre em contato: viniciusdemoraespro@gmail.com

---

**Desenvolvido com ❤️ e ☕ - Janeiro 2026**
