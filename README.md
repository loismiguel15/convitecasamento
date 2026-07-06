# Convite de casamento — Loís & Giovanna

Convite responsivo para o casamento de Loís Miguel de Lima e Giovanna Aparecida Leão em 18/12/2027. O projeto inclui animação de abertura, contagem regressiva, história, cerimônia, galeria, presentes com QR Code PIX, RSVP, mural de recados e painel administrativo.

O banco de dados usado em produção é Supabase PostgreSQL.

## Tecnologias

- React + Vite
- Tailwind CSS
- Framer Motion
- Node.js + Express
- PostgreSQL com Supabase
- Render para hospedagem

## Configurar o Supabase

1. Acesse https://supabase.com e crie um projeto.
2. Abra o projeto e vá em `Project Settings`.
3. Entre em `Database`.
4. Copie a connection string PostgreSQL.
5. Use a opção de conexão com senha e substitua `[YOUR-PASSWORD]` pela senha do banco.

Exemplo de formato:

```env
DATABASE_URL=postgresql://postgres.sua-ref:sua-senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

Não coloque essa senha dentro do código e não publique em commit.

## Variáveis de ambiente

Crie um arquivo `.env` apenas para rodar localmente, se desejar:

```env
DATABASE_URL=sua_connection_string_do_supabase
ADMIN_PASSWORD=admin123
SESSION_SECRET=uma-frase-longa-e-aleatoria
```

No Render, configure pelo painel em:

`Environment` → `Environment Variables`

Adicione:

- `DATABASE_URL`: connection string do Supabase
- `ADMIN_PASSWORD`: senha do painel administrativo
- `SESSION_SECRET`: frase longa e aleatória para assinar a sessão

## Executar localmente

Requer Node.js 24.

No PowerShell:

```powershell
npm.cmd install
npm.cmd run install:all
npm.cmd run dev
```

Se estiver usando `.env`, carregue antes de iniciar o backend ou configure as variáveis no terminal.

Exemplo:

```powershell
$env:DATABASE_URL="sua_connection_string_do_supabase"
$env:ADMIN_PASSWORD="admin123"
$env:SESSION_SECRET="uma-frase-longa-e-aleatoria"
npm.cmd run dev
```

- Site: http://localhost:5173
- Painel: http://localhost:5173/admin

Ao iniciar, o backend conecta no Supabase, cria as tabelas automaticamente se elas não existirem e mostra no console:

```text
Banco Supabase conectado com sucesso
```

## Produção

```powershell
npm.cmd run build
npm.cmd start
```

Após o build, frontend e API ficam disponíveis em http://localhost:3001.

## Deploy no Render

O `render.yaml` já está preparado para usar PostgreSQL externo pelo Supabase.

No Render:

1. Abra o serviço do site.
2. Vá em `Environment`.
3. Adicione `DATABASE_URL` com a connection string do Supabase.
4. Adicione `ADMIN_PASSWORD`.
5. Deixe `SESSION_SECRET` gerado pelo Render ou coloque uma frase segura.
6. Faça novo deploy.

Não é necessário contratar Disk no Render para o banco, porque os dados ficam no Supabase.

Observação: imagens enviadas pelo painel via upload local podem ser temporárias no Render sem Disk. Para imagens permanentes, prefira usar links de imagem no painel.

## Tabelas criadas automaticamente

- `confirmations`
- `messages`
- `gifts`
- `gallery`
- `wedding_settings`

A tabela `gallery` foi mantida porque o painel já possui aba para gerenciar fotos da galeria.

## Painel administrativo

Em `/admin` é possível:

- consultar e excluir confirmações;
- acompanhar convidados e acompanhantes;
- consultar e excluir recados;
- cadastrar, editar e excluir presentes;
- cadastrar, editar e excluir fotos da galeria;
- exportar confirmações em CSV;
- alterar nomes, data, horário, local, PIX, WhatsApp, Instagram, música e introdução da história.

As alterações em `Informações` aparecem automaticamente no convite público.

## Personalização

- Hero: `frontend/public/images/hero-wedding.png`
- Igreja: `frontend/public/images/igreja-matriz-editada.png`
- Música: coloque um arquivo em `frontend/public/music` e informe o caminho no painel, por exemplo `/music/nossa-musica.mp3`
- Cores: `frontend/tailwind.config.js`
- Configuração reserva: `frontend/src/config.js`

Para o Instagram, informe no painel o link completo, como `https://instagram.com/usuario`.

Para o WhatsApp, utilize DDI + DDD + número, somente dígitos.

## Publicar alterações

```powershell
git add .
git commit -m "Migra banco para Supabase PostgreSQL"
git push
```

O Render iniciará um novo deploy após o push.
