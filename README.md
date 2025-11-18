# pesca-bot

Esse é um bot de pescaria 🎣🐠 para o WhatsApp!

## Como executar

Primeiro instale as depêndencias:

```bash
bun install
```

Adicione um arquivo .env conforme o exemplo (você precisa ter um mongodb rodando):

```
DB_CONN_STRING="mongodb://diego:pescacria@localhost:27017"
DB_NAME="pesca-mongodb"
NODE_ENV="development"
```

Gere o arquivo fishes.json com os comandos:

```bash
Rscript src/scripts/getFishes.R
bun run src/utils/parseFishesRarity.ts
bun run src/utils/parseFishesWeight.ts
```

E então você poderá executar com o comando:

```bash
bun start
```
