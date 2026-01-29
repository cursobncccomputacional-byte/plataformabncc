# Currículo de Computação – Educação Infantil

## Eixos corretos (BNCC Computacional)

| Códigos        | Eixo                    |
|----------------|-------------------------|
| EI03CO01–EI03CO06 | **Pensamento Computacional** |
| EI03CO07–EI03CO09 | **Mundo Digital**           |
| EI03CO10–EI03CO11 | **Cultura Digital**         |

O script anterior associou todas as habilidades ao eixo “Pensamento Computacional”; os eixos acima são os corretos.

---

## Duas formas de armazenar

### 1. Tabelas do currículo (script atualizado – Gemini)

**Arquivo:** `curriculo-computacao-educacao-infantil.sql`

Cria e popula:

- **curriculo_etapas_ensino** – etapa (ex.: Educação Infantil)
- **curriculo_habilidades** – código, **eixo**, descrição, explicação
- **curriculo_exemplos_praticos** – uma linha por tipo (Plugada / Desplugada / (Des)plugada)
- **curriculo_materiais_complementares** – descrição + **link**

O prefixo `curriculo_` evita conflito com a tabela **habilidades** já usada no projeto.

**Uso:** executar o script no MySQL; em seguida é possível criar API/frontend que leiam essas tabelas.

### 2. Tabela única BNCC Digital (bncc_computacional)

**Arquivo:** `bncc-educacao-infantil-inserts.sql` (versão com eixos corrigidos)

Continua usando apenas **bncc_computacional** (já usada pelo app). Os eixos foram ajustados para:

- EI03CO01–06 → Pensamento Computacional  
- EI03CO07–09 → Mundo Digital  
- EI03CO10–11 → Cultura Digital  

Exemplos e materiais seguem em um único texto/coluna; não há tabelas separadas de exemplos nem de materiais com link.

---

## Resumo

- **Eixos:** use sempre Pensamento Computacional | Mundo Digital | Cultura Digital conforme a tabela acima.
- **Estrutura nova (recomendada para currículo completo):** rodar `curriculo-computacao-educacao-infantil.sql` e depois integrar API/frontend às tabelas `curriculo_*`.
- **Manter só bncc_computacional:** usar o script de INSERT com eixos corrigidos em `bncc-educacao-infantil-inserts.sql`.
