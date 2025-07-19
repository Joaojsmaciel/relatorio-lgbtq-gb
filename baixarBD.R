# instalar os pacotes 
library(basedosdados)
library(tidyverse)
library(bigrquery)
library(ggplot2)


# etapa 1: autenticar com sua conta Google
bq_auth()

# etapa 2: definir o ID do projeto da cobrança
basedosdados::set_billing_id("inspired-bus-461420-t4")

# etapa 3: escrever queries
query_causa_obito <- "
SELECT
    dados.prop_homicidios_total as prop_homicidios_total,
    dados.homicidios as homicidios,
    dados.ano as ano,
    dados.causa_obito as causa_obito
FROM `basedosdados.br_ggb_relatorio_lgbtqi.causa_obito` AS dados
"

query_brasil <- "
SELECT
    dados.homicidios as homicidios,
    dados.ano as ano
FROM `basedosdados.br_ggb_relatorio_lgbtqi.brasil` AS dados
"

query_grupo <- "
SELECT
    dados.grupo as grupo,
    dados.prop_homicidios_total as prop_homicidios_total,
    dados.ano as ano,
    dados.homicidios as homicidios
FROM `basedosdados.br_ggb_relatorio_lgbtqi.grupo_lgbtqia` AS dados
"

query_local <- "
SELECT
    dados.homicidios as homicidios,
    dados.ano as ano,
    dados.local as local,
    dados.prop_homicidios_total as prop_homicidios_total
FROM `basedosdados.br_ggb_relatorio_lgbtqi.local` AS dados
"

query_raca <- "
SELECT
    dados.ano as ano,
    dados.prop_homicidios_total as prop_homicidios_total,
    dados.homicidios as homicidios,
    dados.raca_cor as raca_cor
FROM `basedosdados.br_ggb_relatorio_lgbtqi.raca_cor` AS dados
"

# etapa 4: ler dados
df_causa_obito <- basedosdados::read_sql(query_causa_obito,
                                         billing_project_id = "inspired-bus-461420-t4")

df_brasil <- basedosdados::read_sql(query_brasil,
                                    billing_project_id = "inspired-bus-461420-t4")

df_grupo <- basedosdados::read_sql(query_grupo,
                                   billing_project_id = "inspired-bus-461420-t4")

df_local <- basedosdados::read_sql(query_local,
                                   billing_project_id = "inspired-bus-461420-t4")

df_raca <- basedosdados::read_sql(query_raca,
                                  billing_project_id = "inspired-bus-461420-t4")

# etapa 5: salvar CSV
write_csv(df_causa_obito, "data/CausaObito.csv")
write_csv(df_brasil, "data/homicidios_brasil.csv")
write_csv(df_grupo, "data/homicidios_grupo.csv")
write_csv(df_local, "data/homicidios_local.csv")
write_csv(df_raca, "data/homicidios_raca.csv")

# carregar direto no R (opcional)
read_sql(query_causa_obito, billing_project_id = "inspired-bus-461420-t4")
read_sql(query_brasil, billing_project_id = "inspired-bus-461420-t4")
read_sql(query_grupo, billing_project_id = "inspired-bus-461420-t4")
read_sql(query_local, billing_project_id = "inspired-bus-461420-t4")
read_sql(query_raca, billing_project_id = "inspired-bus-461420-t4")

# ETAPA 6: gerar boxplot - homicídios por grupo ao longo dos anos
ggplot(df_grupo, aes(x = grupo, y = homicidios)) +
  geom_boxplot(fill = "steelblue", outlier.color = "red", outlier.shape = 1) +
  facet_wrap(~ ano, scales = "free_y") +
  theme_minimal() +
  labs(
    title = "Distribuição de Homicídios por Grupo LGBTQIA+ (por Ano)",
    x = "Grupo",
    y = "Número de Homicídios"
  ) +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1),
    strip.text = element_text(face = "bold")
  )
