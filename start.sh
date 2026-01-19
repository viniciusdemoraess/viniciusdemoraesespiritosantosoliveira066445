#!/bin/bash

# Script de inicialização completa do projeto
# Desenvolvido para o projeto SEPLAG - Artist & Album Management

set -e

echo "🎵 Artist & Album Management System - Setup Script"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker encontrado${NC}"
echo ""

# Parar containers existentes
echo -e "${BLUE}🛑 Parando containers existentes...${NC}"
docker-compose down

# Limpar volumes (opcional)
read -p "Deseja limpar volumes existentes (dados serão perdidos)? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Limpando volumes...${NC}"
    docker-compose down -v
fi

# Build das imagens
echo -e "${BLUE}🔨 Construindo imagens Docker...${NC}"
docker-compose build --no-cache

# Iniciar serviços
echo -e "${BLUE}🚀 Iniciando serviços...${NC}"
docker-compose up -d

# Aguardar serviços ficarem prontos
echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"
echo ""

echo -e "${YELLOW}Aguardando PostgreSQL...${NC}"
until docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; do
    printf "."
    sleep 2
done
echo -e "${GREEN}✅ PostgreSQL pronto${NC}"

echo -e "${YELLOW}Aguardando MinIO...${NC}"
until curl -sf http://localhost:9000/minio/health/live &> /dev/null; do
    printf "."
    sleep 2
done
echo -e "${GREEN}✅ MinIO pronto${NC}"

echo -e "${YELLOW}Aguardando API...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
until curl -sf http://localhost:8080/actuator/health/liveness &> /dev/null; do
    printf "."
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ Timeout aguardando API${NC}"
        echo -e "${YELLOW}Verifique os logs com: docker-compose logs api${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ API pronta${NC}"

echo ""
echo -e "${GREEN}=================================================="
echo "✅ Sistema iniciado com sucesso!"
echo "==================================================${NC}"
echo ""
echo -e "${BLUE}📍 Serviços disponíveis:${NC}"
echo ""
echo -e "  🌐 API Backend:       ${GREEN}http://localhost:8080${NC}"
echo -e "  📚 Swagger UI:        ${GREEN}http://localhost:8080/swagger-ui.html${NC}"
echo -e "  🎨 Frontend:          ${GREEN}http://localhost:4200${NC}"
echo -e "  🗄️  PostgreSQL:        ${GREEN}localhost:5432${NC}"
echo -e "  📦 MinIO Console:     ${GREEN}http://localhost:9001${NC}"
echo -e "  ❤️  Health Check:      ${GREEN}http://localhost:8080/actuator/health${NC}"
echo ""
echo -e "${BLUE}🔑 Credenciais padrão:${NC}"
echo -e "  Username: ${YELLOW}admin${NC}"
echo -e "  Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo -e "  Ver logs:             ${YELLOW}docker-compose logs -f api${NC}"
echo -e "  Parar serviços:       ${YELLOW}docker-compose down${NC}"
echo -e "  Reiniciar API:        ${YELLOW}docker-compose restart api${NC}"
echo -e "  Executar testes:      ${YELLOW}cd backend && ./mvnw test${NC}"
echo ""
echo -e "${GREEN}Bom desenvolvimento! 🚀${NC}"
