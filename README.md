<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>
# Desafio INMETA

**Projeto**: API construída com NestJS que gerencia usuários, funcionários, solicitações de documentos e upload de arquivos.

**Tecnologias**: Node.js, NestJS, TypeScript, TypeORM, PostgreSQL, MinIO (S3 compatible), JWT

**Visão geral**
- Esta API oferece endpoints para autenticação, gerenciamento de usuários, funcionários, tipos de documento, solicitações de documento e uploads. Possui suporte a roles (por exemplo: `employee`, `recruiter`, `admin`) e proteção por JWT.

**Pré-requisitos**
- Node.js (versão 24)
- pnpm (ou npm/yarn — os comandos abaixo usam `pnpm`)
- PostgreSQL ou banco compatível usado pela aplicação
- Um servidor S3/MinIO para armazenar arquivos (opcionalmente MinIO local)

**Instalação (local)**
1. Copie o arquivo de ambiente exemplo `.env.example` para `.env` e ajuste as variáveis:

```bash
cp .env.example .env
# Edite .env para apontar para suas credenciais/serviços
```

2. Instale dependências e rode a aplicação em dev:

```bash
pnpm install
pnpm start
```

**Variáveis de ambiente necessárias**
- `PORT` — porta em que a API roda (ex: `3014`)
- `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE` — configuração do PostgreSQL
- `MINIO_ENDPOINT`, `MINIO_BUCKET`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_PUBLIC_URL` — configuração do storage S3/MinIO
  - ⚠️ **Importante**: Certifique-se de que o usuário MinIO tem permissões de leitura/escrita no bucket. Execute `node test-minio.js` para testar a conexão.
- `JWT_SECRET` — segredo para assinatura dos access tokens
- `JWT_REFRESH_SECRET` — segredo para assinatura dos refresh tokens (7 dias de validade)

Este `.env.example` não inclui valores sensíveis. O arquivo `.env.example` presente no repositório contém exemplos, portanto substitua por suas credenciais locais.

**Scripts úteis** (no `package.json`)
- `pnpm start` — inicia a aplicação (modo dev via Nest)
- `pnpm start:debug` — inicia com debugger e watch
- `pnpm start:prod` — inicia a versão compilada (`node dist/main`)
- `pnpm build` — compila TypeScript para `dist/`
- `pnpm lint` — executa ESLint com correções
- `pnpm format` — formata o código com Prettier
- `pnpm test` — executa testes com Jest
- `pnpm test:cov` — executa testes com cobertura
- `pnpm test:e2e` — executa testes e2e
- `node test-minio.js` — testa conexão e permissões do MinIO

**Documentação Swagger**
- A aplicação expõe a UI do Swagger em `GET /swagger` quando estiver em execução.
- **Autenticação no Swagger**: Após fazer login, clique no botão "Authorize" (🔒) no topo da página, cole o `access_token` (sem a palavra "Bearer") e clique em "Authorize". O token será automaticamente incluído em todas as requisições e persistido mesmo após recarregar a página.
- **Todos os endpoints requerem autenticação**, exceto `POST /auth/login`, `POST /auth/refresh` e `POST /auth/debug/verify`.

**Endpoints principais**

Observação: a maioria dos endpoints que alteram dados exige autenticação via JWT (Bearer token). Endpoints que requerem roles específicas estão indicados.

- **Auth** (`/auth`)
  - `POST /auth/login` — login com `identifier` (email ou username) e `password`.
    - Exemplo de body: `{ "identifier": "admin@example.com", "password": "123456" }`
    - Retorno: `{ "access_token": "...", "refresh_token": "..." }`
  - `POST /auth/refresh` — refresh token: body `{ "refreshToken": "..." }` → retorna novos tokens.
  - `POST /auth/logout` — revoga um refresh token (body `{ "refreshToken": "..." }`). Requer `Authorization: Bearer <access_token>`.
  - `GET /auth/me` — retorna o usuário autenticado. Requer `Authorization`.

- **User** 
  - ⚠️ **Endpoints de User foram removidos**. O gerenciamento de usuários agora é feito através dos endpoints de Employee. A entidade User ainda existe internamente para autenticação.

- **Employee** (`/employee`)
  - `POST /employee` — cria funcionário. Requer autenticação.
  - `GET /employee` — lista funcionários. Requer autenticação.
  - `GET /employee/:id` — obtém funcionário por id. Requer autenticação.
  - `PATCH /employee/:id` — atualiza funcionário. Requer autenticação.
  - `DELETE /employee/:id` — remove funcionário (`204`). Requer role `admin`.
  - `GET /employee/:id/document-status` — retorna o status dos documentos do funcionário. Requer autenticação.

- **Document Request** (`/document-request`)
  - `GET /document-request/pending` — lista solicitações pendentes (aceita query params: `page`, `limit`, `employeeId`, `documentTypeId`). Requer autenticação.
  - `GET /document-request` — lista todas as solicitações. Requer autenticação.
  - `GET /document-request/:id` — obtém uma solicitação por id. Requer autenticação.
  - `POST /document-request` — cria uma solicitação de documento. Requer roles `recruiter` ou `admin`.
  - `PATCH /document-request/:id` — atualiza a solicitação. Requer autenticação.
  - `POST /document-request/:id/upload` — faz upload do arquivo para a solicitação. Requer `Authorization` e role `employee`. Aceita `multipart/form-data` com campo `file` (PDF/DOCX). Tamanho máximo: 5MB.
  - `POST /document-request/:id/approve` — aprova a solicitação. Requer role `recruiter` ou `admin`. Body exemplo: `{ "approvedBy": 123 }`.
  - `DELETE /document-request/:id` — remove a solicitação (`204`). Requer role `admin`.

- **Document Type** (`/document-type`)
  - `POST /document-type` — cria um tipo de documento. Requer autenticação.
  - `GET /document-type` — lista tipos. Requer autenticação.
  - `GET /document-type/:id` — obtém tipo por id. Requer autenticação.
  - `PATCH /document-type/:id` — atualiza tipo. Requer autenticação.
  - `DELETE /document-type/:id` — remove tipo (`204`). Requer role `admin`.

- **Upload** 
  - ⚠️ **Endpoint standalone `/upload` foi removido**. Uploads agora são feitos exclusivamente através de `POST /document-request/:id/upload`.

**Observações sobre Uploads**
- Os uploads aceitos para `document-request/:id/upload` são restritos a **PDF e DOCX apenas**. Mime-types permitidos e extensão verificada no servidor. Tamanho máximo: **5 MB**.
- Os arquivos são armazenados no MinIO/S3 configurado nas variáveis de ambiente.
- Campos de auditoria `uploadedBy` e `uploadedAt` são automaticamente preenchidos quando um funcionário faz upload.

**Autenticação & Roles**
- Autenticação é feita por JWT no header `Authorization: Bearer <token>`.
- **Access tokens** têm validade de **15 minutos**. **Refresh tokens** têm validade de **7 dias**.
- Há um sistema de refresh tokens armazenados no banco; ao usar `POST /auth/refresh` o refresh token usado é rotacionado e o antigo é revogado.
- O logout (`POST /auth/logout`) revoga o refresh token no banco, impedindo novas renovações.
- Algumas rotas exigem roles (`@Roles('employee')`, `@Roles('recruiter','admin')`). Verifique a documentação da API (`/swagger`) para detalhes adicionais.
- **Todos os endpoints requerem autenticação por padrão**, exceto os marcados com `@Public()`: login, refresh e debug/verify.

**Exemplos (curl)**
- Login:

```bash
curl -X POST http://localhost:3014/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"admin@example.com","password":"123456"}'
```

- Upload de arquivo para uma solicitação (usando access token):

```bash
curl -X POST http://localhost:3014/document-request/42/upload \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "file=@/caminho/para/documento.pdf"
```

**Docker / Docker Compose**
- O repositório contém `Dockerfile` e `docker-compose.yml`. Para subir com Docker Compose (ajuste o `.env`/variáveis):

```bash
docker compose up --build
```

**Rodando testes**
- Unit tests: `pnpm test`
- Cobertura: `pnpm test:cov`
- E2E: `pnpm test:e2e`