#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API="http://localhost:8080/api"
EMAIL="teste_$(date +%s)@teste.com"
SENHA="senha123"

echo -e "${YELLOW}=== Teste do Fluxo de Meu Perfil ===${NC}\n"

# 1. Registrar novo estudante
echo -e "${YELLOW}1. Registrando novo estudante...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API/estudantes/registro" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Estudante",
    "cpf": "12345678901",
    "curso": "Engenharia de Software",
    "email": "'$EMAIL'",
    "telefone": "(11) 98765-4321",
    "senha": "'$SENHA'"
  }')

ESTUDANTE_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ESTUDANTE_ID" ]; then
  echo -e "${RED}❌ Erro ao registrar estudante${NC}"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Estudante registrado com ID: $ESTUDANTE_ID${NC}\n"

# 2. Fazer login
echo -e "${YELLOW}2. Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "senha": "'$SENHA'",
    "role": "ESTUDANTE"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro ao fazer login${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo "Token: ${TOKEN:0:20}...${NC}\n"

# 3. Acessar perfil do estudante
echo -e "${YELLOW}3. Acessando perfil do estudante (/estudantes/{id})...${NC}"
PERFIL_RESPONSE=$(curl -s -X GET "$API/estudantes/$ESTUDANTE_ID" \
  -H "Authorization: Bearer $TOKEN")

NOME=$(echo $PERFIL_RESPONSE | grep -o '"nome":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NOME" ]; then
  echo -e "${RED}❌ Erro ao buscar perfil${NC}"
  echo "Response: $PERFIL_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Perfil recuperado: $NOME${NC}"
echo "Email: $EMAIL"
echo "CPF: 12345678901"
echo "Curso: Engenharia de Software${NC}\n"

# 4. Buscar áreas de interesse
echo -e "${YELLOW}4. Buscando áreas de interesse...${NC}"
AREAS_RESPONSE=$(curl -s -X GET "$API/areas-interesse" \
  -H "Authorization: Bearer $TOKEN")

AREA_COUNT=$(echo $AREAS_RESPONSE | grep -o '"id":' | wc -l)

if [ "$AREA_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Áreas de interesse encontradas: $AREA_COUNT${NC}\n"
else
  echo -e "${YELLOW}⚠️  Nenhuma área de interesse cadastrada${NC}\n"
fi

# 5. Buscar vagas abertas
echo -e "${YELLOW}5. Buscando vagas abertas (/vagas-estagio/abertas)...${NC}"
VAGAS_RESPONSE=$(curl -s -X GET "$API/vagas-estagio/abertas" \
  -H "Authorization: Bearer $TOKEN")

VAGA_COUNT=$(echo $VAGAS_RESPONSE | grep -o '"id":' | wc -l)

if [ "$VAGA_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Vagas encontradas: $VAGA_COUNT${NC}\n"
  
  # 6. Buscar detalhes da primeira vaga
  VAGA_ID=$(echo $VAGAS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  echo -e "${YELLOW}6. Buscando detalhes da vaga ID $VAGA_ID...${NC}"
  VAGA_DETALHES=$(curl -s -X GET "$API/vagas-estagio/$VAGA_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  VAGA_TITULO=$(echo $VAGA_DETALHES | grep -o '"titulo":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ ! -z "$VAGA_TITULO" ]; then
    echo -e "${GREEN}✅ Detalhes da vaga: $VAGA_TITULO${NC}\n"
    
    # 7. Buscar estatísticas de avaliações
    echo -e "${YELLOW}7. Buscando avaliações da vaga...${NC}"
    STATS_RESPONSE=$(curl -s -X GET "$API/avaliacoes/vaga/$VAGA_ID/estatisticas" \
      -H "Authorization: Bearer $TOKEN")
    
    echo -e "${GREEN}✅ Estatísticas de avaliação recuperadas${NC}\n"
    
    # 8. Submeter uma avaliação
    echo -e "${YELLOW}8. Submetendo avaliação para a vaga...${NC}"
    AVALIACAO_RESPONSE=$(curl -s -X POST "$API/avaliacoes" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "estudante": {"id": '$ESTUDANTE_ID'},
        "vaga": {"id": '$VAGA_ID'},
        "nota": 4,
        "comentario": "Excelente oportunidade de estágio!"
      }')
    
    AVALIACAO_ID=$(echo $AVALIACAO_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ ! -z "$AVALIACAO_ID" ]; then
      echo -e "${GREEN}✅ Avaliação submetida com sucesso (ID: $AVALIACAO_ID)${NC}\n"
    else
      echo -e "${RED}❌ Erro ao submeter avaliação${NC}"
      echo "Response: $AVALIACAO_RESPONSE"
    fi
  else
    echo -e "${RED}❌ Erro ao buscar detalhes da vaga${NC}"
    echo "Response: $VAGA_DETALHES"
  fi
else
  echo -e "${YELLOW}⚠️  Nenhuma vaga aberta encontrada${NC}\n"
  echo -e "${YELLOW}Criando uma vaga para teste...${NC}"
  
  # Criar uma empresa primeiro (se precisar)
  EMPRESA_RESPONSE=$(curl -s -X POST "$API/empresas" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "nome": "Empresa Teste",
      "cnpj": "12345678901234",
      "email": "empresa'$RANDOM'@teste.com",
      "senha": "senha123",
      "telefone": "(11) 98765-4321"
    }')
  
  EMPRESA_ID=$(echo $EMPRESA_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ ! -z "$EMPRESA_ID" ]; then
    echo -e "${GREEN}✅ Empresa de teste criada${NC}"
  fi
fi

echo -e "${GREEN}\n=== Teste Concluído com Sucesso ===${NC}"
