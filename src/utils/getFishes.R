library(rfishbase)
library(dplyr)
library(jsonlite)

# Tabelas principais
garantir_csv <- function(tbl) fb_tbl(tbl)
country_tbl  <- garantir_csv("country")
br           <- country_tbl %>% filter(C_Code == "076")
comnames_tbl <- garantir_csv("comnames")
br_names_pt  <- comnames_tbl %>% filter(SpecCode %in% br$SpecCode, Language == "Portuguese")
species_tbl  <- garantir_csv("species")

# Junte as tabelas -- preserve 'Abundance' do country_tbl/br!
br_species <- br %>%
  left_join(species_tbl, by = "SpecCode") %>%
  left_join(br_names_pt %>% select(SpecCode, ComName), by = "SpecCode")

# Apenas linhas com nome comum
tem_nome <- br_species %>% filter(!is.na(ComName))

# Se 'Abundance' não existir (caso raro), crie como branco para padronizar
tem_nome$Abundance <- if(!"Abundance" %in% names(tem_nome)) " " else tem_nome$Abundance

# Seleciona e renomeia colunas para JSON "clean"
limpo <- tem_nome %>%
  select(
    name = ComName,
    genus = Genus,
    species = Species,
    maxLength = Length,
    commonLength = CommonLength,
    maxWeight = Weight,
    depthMax = DepthRangeDeep,
    vulnerability = Vulnerability,
    abundance = Abundance
  ) %>%
  mutate(
    abundance = ifelse(is.na(abundance) | abundance == "NA", " ", as.character(abundance))
  )

# Salva o JSON
write_json(limpo, "src/data/fishes.json", pretty = TRUE, auto_unbox = TRUE)
