#!/bin/bash

# Script para parar e limpar o ambiente
# Desenvolvido para o projeto SEPLAG

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Parando containers...${NC}"
docker-compose down

read -p "Deseja remover volumes (dados serão perdidos)? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}🗑️  Removendo volumes...${NC}"
    docker-compose down -v
fi

read -p "Deseja remover imagens Docker? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}🗑️  Removendo imagens...${NC}"
    docker-compose down --rmi all
fi

echo -e "${GREEN}✅ Ambiente limpo!${NC}"
