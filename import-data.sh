#!/bin/bash

# Copiar arquivos JSON para o container
docker cp src/data/fishes.json pesca-mongodb:/tmp/fishes.json
docker cp src/data/rods.json pesca-mongodb:/tmp/rods.json
docker cp src/data/trash.json pesca-mongodb:/tmp/trash.json

# Importar fishes
docker exec pesca-mongodb mongoimport \
  --username diego \
  --password pescacria \
  --authenticationDatabase admin \
  --db pesca-bot \
  --collection fishes \
  --file /tmp/fishes.json \
  --jsonArray \
  --drop

# Importar rods
docker exec pesca-mongodb mongoimport \
  --username diego \
  --password pescacria \
  --authenticationDatabase admin \
  --db pesca-bot \
  --collection rods \
  --file /tmp/rods.json \
  --jsonArray \
  --drop

# Importar trash
docker exec pesca-mongodb mongoimport \
  --username diego \
  --password pescacria \
  --authenticationDatabase admin \
  --db pesca-bot \
  --collection trash \
  --file /tmp/trash.json \
  --jsonArray \
  --drop

echo "✅ Dados importados com sucesso!"
