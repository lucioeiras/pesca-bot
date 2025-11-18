# pesca-bot

Esse é um bot de pescaria 🎣🐠 para o WhatsApp!

## Como executar

Primeiro instale as depêndencias:

```bash
bun install
```

Adicione um arquivo .env conforme o exemplo (você precisa ter um mongodb rodando):

```
DB_CONN_STRING="mongodb://<usuario>:<senha>mongodb@localhost:27017"
DB_NAME="pesca-mongodb"
USERS_COLLECTION_NAME="users"
```

Gere o arquivo fishes.json com os comandos:

```bash
Rscript src/utils/getFishes.R
bun run src/utils/parseFishes.ts
```

E então você poderá executar com o comando:

```bash
bun start
```
