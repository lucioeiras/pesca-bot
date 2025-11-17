library(rfishbase)
library(dplyr)
library(jsonlite)

# Garanta o formato CSV para evitar erros do pacote
country_tbl  <- fb_tbl("country")
br           <- country_tbl %>% filter(C_Code == "076")

comnames_tbl <- fb_tbl("comnames")
br_names_pt  <- comnames_tbl %>% filter(SpecCode %in% br$SpecCode, Language == "Portuguese")

species_tbl  <- fb_tbl("species")

# Junte a base de espécies BR com nomes científicos e nomes comuns em português
br_species <- br %>%
  left_join(species_tbl, by = "SpecCode") %>%
  left_join(br_names_pt %>% select(SpecCode, ComName), by = "SpecCode")

# Filtre apenas linhas com nome comum não nulo
br_species <- br_species %>% filter(!is.na(ComName))

# Supondo que sua tabela principal é br_species
limpo <- br_species %>%
  select(
    name = ComName,
    genus = Genus,
    species = Species,
    maxLength = Length,
    commonLength = CommonLength,
    maxWeight = Weight,
    depthMax = DepthRangeDeep,
    vulnerability = Vulnerability
  )

# Salve como JSON com o novo formato
dados_json <- toJSON(limpo, pretty = TRUE, auto_unbox = TRUE)
write(dados_json, "src/data/fishes.json")
