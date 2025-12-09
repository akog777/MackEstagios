#!/usr/bin/env bash
set -euo pipefail

echo "=== E2E: registrar estudante ==="
REG_STUD=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/estudantes/registro \
  -H "Content-Type: application/json" \
  -d '{"nome":"E2E Student","email":"e2e.student@example.com","telefone":"11900001111","cpf":"11111111111","curso":"Engenharia","senha":"senha123"}')
echo "$REG_STUD"

echo "\n=== E2E: login estudante ==="
LOGIN_STUD_RESP=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e.student@example.com","senha":"senha123","role":"estudante"}')
echo "$LOGIN_STUD_RESP"
TOKEN_STUD=$(echo "$LOGIN_STUD_RESP" | jq -r '.token // .accessToken // .data.token // empty' || true)
STUD_ID=$(echo "$LOGIN_STUD_RESP" | jq -r '.id // .data.id // empty' || true)
if [ -z "$TOKEN_STUD" ] || [ "$TOKEN_STUD" = "null" ]; then
  echo "Aviso: token do estudante não encontrado"
fi

echo "\n=== E2E: registrar empresa ==="
REG_COMP=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/empresas/registro \
  -H "Content-Type: application/json" \
  -d '{"nome":"E2E Empresa","email":"e2e.empresa@example.com","telefone":"11900002222","cnpj":"22222222000100","senha":"senha123"}')
echo "$REG_COMP"

echo "\n=== E2E: login empresa ==="
LOGIN_COMP_RESP=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e.empresa@example.com","senha":"senha123","role":"empresa"}')
echo "$LOGIN_COMP_RESP"
TOKEN_COMP=$(echo "$LOGIN_COMP_RESP" | jq -r '.token // .accessToken // .data.token // empty' || true)
COMP_ID=$(echo "$LOGIN_COMP_RESP" | jq -r '.id // .data.id // empty' || true)
if [ -z "$TOKEN_COMP" ] || [ "$TOKEN_COMP" = "null" ]; then
  echo "Aviso: token da empresa não encontrado"
fi

VAGA_ID=""
if [ -n "$TOKEN_COMP" ] && [ "$TOKEN_COMP" != "null" ]; then
  echo "\n=== E2E: criar vaga (empresa) ==="
  CREATE_VAGA=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/vagas-estagio \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN_COMP" \
    -d '{"titulo":"Estágio E2E","descricao":"Vaga para teste E2E","local":"Remoto","salario":"0"}')
  echo "$CREATE_VAGA"
  VAGA_ID=$(echo "$CREATE_VAGA" | jq -r '.id // .data.id // empty' || true)
  echo "Vaga id: $VAGA_ID"
else
  echo "Sem token da empresa — pulando criação de vaga"
fi

if [ -n "$TOKEN_STUD" ] && [ -n "$VAGA_ID" ]; then
  echo "\n=== E2E: inscrever estudante na vaga ==="
  INSCR=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/inscricoes \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN_STUD" \
    -d "{\"vaga\":{\"id\":$VAGA_ID},\"estudante\":{\"id\":$STUD_ID}}")
  echo "$INSCR"
else
  echo "Sem token estudante ou vaga id — pulando inscrição"
fi

if [ -n "$TOKEN_STUD" ] && [ -n "$VAGA_ID" ]; then
  echo "\n=== E2E: avaliar vaga (estudante) ==="
  EVAL=$(curl -sS -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/avaliacoes \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN_STUD" \
    -d "{\"vaga\":{\"id\":$VAGA_ID},\"estudante\":{\"id\":$STUD_ID},\"nota\":5,\"comentario\":\"Ótimo\"}")
  echo "$EVAL"
else
  echo "Sem base para avaliação — pulando"
fi
