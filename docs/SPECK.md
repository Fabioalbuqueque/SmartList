# Software Design Document (SDD)
## SmartList — Gerenciador Inteligente de Compras

| | |
|---|---|
| **Versão** | 1.0 |
| **Data** | Julho de 2026 |
| **Status** | Rascunho para revisão |
| **Plataforma-alvo** | PWA / Web / Android |

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Objetivos e Escopo](#2-objetivos-e-escopo)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Stack Tecnológica](#4-stack-tecnológica)
5. [Modelo de Dados](#5-modelo-de-dados)
6. [Casos de Uso](#6-casos-de-uso)
7. [Especificação de Telas](#7-especificação-de-telas)
8. [Fluxos Principais](#8-fluxos-principais)
9. [Regras de Negócio](#9-regras-de-negócio)
10. [Requisitos Funcionais](#10-requisitos-funcionais)
11. [Requisitos Não Funcionais](#11-requisitos-não-funcionais)
12. [Segurança e Autenticação](#12-segurança-e-autenticação)
13. [Relatórios e Exportação](#13-relatórios-e-exportação)
14. [Roadmap / Funcionalidades Futuras](#14-roadmap--funcionalidades-futuras)
15. [Escopo Removido](#15-escopo-removido)
16. [Riscos e Considerações Técnicas](#16-riscos-e-considerações-técnicas)

---

## 1. Visão Geral do Sistema

O **SmartList** é um aplicativo de gerenciamento de listas de compras que atua também como uma ferramenta de **controle financeiro doméstico**. Além de organizar produtos em listas, o sistema calcula automaticamente valores, categoriza gastos, armazena histórico de preços e apresenta um dashboard analítico com gráficos, metas e rankings de consumo.

O sistema é multiplataforma (PWA, Web e Android), com sincronização em nuvem via Firebase, permitindo que o usuário acesse suas listas e seu histórico financeiro de qualquer dispositivo.

---

## 2. Objetivos e Escopo

### 2.1 Objetivos do Produto

- Organizar compras em listas independentes e reutilizáveis.
- Calcular automaticamente subtotais e totais por lista.
- Controlar gastos mensais e por categoria.
- Apresentar estatísticas e gráficos de consumo.
- Manter histórico completo de compras e preços.
- Apoiar a economia doméstica através de metas de gasto.

### 2.2 Fora de Escopo (versão atual)

- Leitura de código de barras.
- Registro de forma de pagamento.
- Gestão de promoções/cupons.

*(ver seção 15 para detalhes)*

---

## 3. Arquitetura do Sistema

### 3.1 Visão Macro

```
┌─────────────────────────────────────────────┐
│              CLIENTE (Angular 21)             │
│  PWA / Web / Android (via wrapper/Capacitor)  │
│                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │  Módulo   │  │  Módulo   │  │  Módulo   │ │
│  │  Listas   │  │ Dashboard │  │ Relatórios│ │
│  └───────────┘  └───────────┘  └───────────┘ │
│         Angular Signals (estado reativo)      │
└───────────────────┬───────────────────────────┘
                     │ SDK Firebase
                     ▼
┌─────────────────────────────────────────────┐
│               FIREBASE (Backend)              │
│  ┌────────────────────┐  ┌─────────────────┐ │
│  │ Firebase            │  │ Firestore        │ │
│  │ Authentication       │  │ (NoSQL Database) │ │
│  └────────────────────┘  └─────────────────┘ │
│  ┌────────────────────┐  ┌─────────────────┐ │
│  │ Firebase Storage     │  │ Firebase Hosting  │ │
│  │ (fotos de notas)      │  │ (deploy PWA)       │ │
│  └────────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────┘
```

### 3.2 Padrão Arquitetural

- **Front-end**: Arquitetura modular baseada em *feature modules* do Angular, com componentes standalone e gerenciamento de estado reativo via **Angular Signals** (sem necessidade de NgRx dado o porte do app).
- **Comunicação com backend**: acesso direto ao Firestore via SDK do Firebase (client-side), sem camada de API intermediária própria.
- **Persistência offline**: uso do modo *offline persistence* do Firestore para permitir uso do app sem conexão, com sincronização automática ao reconectar (pré-requisito para o recurso futuro de "Sincronização em tempo real").

### 3.3 Organização de Módulos (Front-end)

```
src/app/
├── core/                # Auth guards, interceptors, serviços singleton
├── shared/               # Componentes, pipes e diretivas reutilizáveis
├── features/
│   ├── listas/            # CRUD de listas de compras
│   ├── produtos/          # Cadastro de produtos
│   ├── categorias/        # Cadastro de categorias
│   ├── locais-compra/      # Cadastro de locais
│   ├── dashboard/          # Gráficos e indicadores
│   ├── relatorios/         # Geração/exportação de relatórios
│   └── configuracoes/      # Preferências do usuário
└── layout/               # Shell, menu lateral, navegação
```

---

## 4. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Front-end | Angular 21, TypeScript, HTML5, CSS3, Angular Signals |
| Autenticação | Firebase Authentication |
| Banco de Dados | Firestore (NoSQL) |
| Armazenamento de arquivos | Firebase Storage (fotos de notas fiscais) |
| Hospedagem | Firebase Hosting |
| Plataformas | PWA, Android, Web |

---

## 5. Modelo de Dados

### 5.1 Diagrama Entidade-Relacionamento (conceitual)

```
usuarios (1) ────< (N) listas
listas (1) ────< (N) listaProdutos (itens da lista)
produtos (1) ────< (N) listaProdutos
categorias (1) ────< (N) produtos
locaisCompra (1) ────< (N) listas
produtos (1) ────< (N) historicoPrecos
```

### 5.2 Coleções Firestore

#### `usuarios`
| Campo | Tipo | Descrição |
|---|---|---|
| id | string | ID do usuário (uid do Firebase Auth) |
| nome | string | Nome completo |
| email | string | E-mail de login |
| foto | string (url) | Foto de perfil |

#### `categorias`
| Campo | Tipo | Descrição |
|---|---|---|
| id | string | Identificador único |
| nome | string | Nome da categoria |
| icone | string | Emoji ou nome do ícone |
| cor | string | Cor de identificação (hex) |
| padrao | boolean | Indica se é categoria padrão do sistema ou personalizada |

#### `produtos`
| Campo | Tipo | Descrição |
|---|---|---|
| id | string | Identificador único |
| nome | string | Nome do produto |
| categoriaId | string (ref) | Referência à categoria |
| marca | string (opcional) | Marca do produto |
| precoMedio | number | Preço médio de referência |
| observacao | string (opcional) | Observações livres |

#### `locaisCompra`
| Campo | Tipo | Descrição |
|---|---|---|
| id | string | Identificador único |
| nome | string | Nome do estabelecimento |
| cidade | string | Cidade do estabelecimento |

#### `listas`
| Campo | Tipo | Descrição |
|---|---|---|
| id | string | Identificador único |
| nome | string | Nome da lista (ex.: "Compras do Mês") |
| tipo | enum | `domestica` \| `evento` \| `trabalho` \| `viagem` \| `outros` |
| responsavel | string | Nome do responsável pela compra |
| localCompra | string (ref) | Referência ao local de compra |
| data | timestamp | Data da lista/compra |
| observacao | string (opcional) | Observações livres |
| fotoNotaFiscal | string (url, opcional) | Link da imagem armazenada no Storage |
| quantidadeItens | number | Total de itens (calculado) |
| total | number | Valor total da lista (calculado) |
| produtos | array\<listaProduto\> | Itens da lista (ver subestrutura abaixo) |

**Subestrutura `listaProduto` (dentro de `listas.produtos[]`)**

| Campo | Tipo | Descrição |
|---|---|---|
| produtoId | string (ref) | Referência ao produto |
| categoriaId | string (ref) | Referência à categoria (redundante para performance de consulta) |
| quantidade | number | Quantidade comprada |
| valorUnitario | number | Valor unitário no momento da compra |
| subtotal | number | `quantidade × valorUnitario` (calculado) |
| observacao | string (opcional) | Observações do item |

#### `historicoPrecos`
| Campo | Tipo | Descrição |
|---|---|---|
| produtoId | string (ref) | Referência ao produto |
| valor | number | Valor registrado |
| data | timestamp | Data da compra que gerou o registro |

> **Nota de design**: sempre que um item é adicionado a uma lista, o sistema deve gravar automaticamente uma entrada em `historicoPrecos`, permitindo o cálculo de variação de preço (seção 8.5).

---

## 6. Casos de Uso

| ID | Caso de Uso | Ator | Descrição |
|---|---|---|---|
| UC01 | Criar lista de compras | Usuário | Cria uma nova lista informando nome, tipo, responsável, local e data |
| UC02 | Adicionar produto à lista | Usuário | Busca ou cadastra um produto e insere na lista com quantidade e valor |
| UC03 | Consultar dashboard financeiro | Usuário | Visualiza total gasto no mês, gráficos por categoria e evolução mensal |
| UC04 | Definir metas de gasto | Usuário | Define meta geral e por categoria, acompanhando percentual atingido |
| UC05 | Consultar histórico de compras | Usuário | Pesquisa listas anteriores por nome, responsável, tipo, produto, local ou data |
| UC06 | Acompanhar evolução de preços | Usuário | Visualiza a variação de preço de um produto ao longo do tempo |
| UC07 | Gerar relatório | Usuário | Gera e exporta relatórios em PDF ou Excel |
| UC08 | Cadastrar categoria personalizada | Usuário | Cria categorias além das padrão do sistema |
| UC09 | Anexar foto da nota fiscal | Usuário | Faz upload de uma imagem da nota vinculada à lista |
| UC10 | Autenticar-se | Usuário | Login/cadastro via Firebase Authentication |

---

## 7. Especificação de Telas

### 7.1 Navegação Principal (Menu Lateral)

- 🏠 Início
- 🛒 Minhas Listas
- 📊 Dashboard
- 📦 Produtos
- 🗂 Categorias
- 📍 Locais de Compra
- 📄 Relatórios
- ⚙ Configurações

### 7.2 Tela: Minhas Listas

Exibe listas existentes (ex.: *Compras do Mês*, *Churrasco*, *Festa*, *Material Escolar*, *Viagem*), cada uma exibindo: nome, responsável, tipo, local, data, quantidade de itens, valor total e observações.

### 7.3 Tela: Criar Nova Lista

**Campos do formulário:**
- Nome da Lista *(obrigatório)*
- Responsável *(obrigatório)*
- Tipo da Lista *(seleção única, obrigatório)*: Doméstica, Evento, Trabalho, Viagem, Outros
- Local da Compra *(obrigatório, com autocomplete)*
- Data *(obrigatório)*
- Observações *(opcional)*
- Ação: botão **Criar Lista**

### 7.4 Tela: Adicionar Produto (dentro de uma lista)

**Campos:**
- Categoria *(seleção)*
- Produto *(busca com autocomplete no cadastro de produtos)*
- Quantidade *(numérico, obrigatório)*
- Valor Unitário *(numérico, obrigatório)*
- Observações *(opcional)*
- Ação: botão **Adicionar**

O subtotal é calculado automaticamente: `Subtotal = Quantidade × Valor Unitário`.

### 7.5 Tela: Detalhe da Lista de Compras

Exibe os itens agrupados por categoria, com subtotais por item e total geral da lista, no formato:

```
🥦 ALIMENTOS
  Arroz — 2 x R$29,90 — Subtotal R$59,80
  Feijão — 3 x R$9,50 — Subtotal R$28,50
🧴 LIMPEZA
  Sabão em Pó — 2 x R$22,90 — Subtotal R$45,80

TOTAL: 15 produtos — R$215,70
```

### 7.6 Tela: Cadastro de Produtos

**Campos:** Nome, Categoria, Marca *(opcional)*, Preço Médio, Observações.

### 7.7 Tela: Categorias

Lista as categorias padrão do sistema (Alimentos, Limpeza, Higiene, Açougue, Laticínios, Hortifruti, Padaria, Bebidas, Pet, Farmácia, Outros) e permite criação de categorias personalizadas (ex.: Automóvel, Games, Bebê, Aquário, Pesca).

### 7.8 Tela: Dashboard Financeiro

Composta pelos seguintes blocos:

1. **Resumo do mês**: total gasto, número de compras, número de produtos, ticket médio.
2. **Gastos por Categoria**: gráfico de pizza com percentual e valor por categoria.
3. **Evolução Mensal**: gráfico de linhas com o total gasto mês a mês.
4. **Produtos Mais Comprados**: ranking (🥇🥈🥉) por quantidade de unidades.
5. **Locais de Compra**: ranking de estabelecimentos por número de compras e valor total.
6. **Gastos por Tipo de Lista**: comparação entre Doméstica, Evento, Viagem, Trabalho.
7. **Metas**: meta geral e metas por categoria, com barra de progresso (% atingido).
8. **Evolução de Preços**: indicador de aumento/queda percentual por produto.
9. **Últimas Compras**: lista cronológica das compras mais recentes.

### 7.9 Tela: Histórico

Permite pesquisa de listas anteriores pelos filtros: Nome, Responsável, Tipo, Categoria, Produto, Local da Compra, Data.

### 7.10 Tela: Relatórios

Permite gerar e exportar (PDF/Excel):
- Gastos por Categoria
- Gastos por Mercado
- Evolução Mensal
- Produtos Mais Comprados
- Produtos com Maior Aumento de Preço
- Histórico Completo

### 7.11 Tela: Configurações

Preferências do usuário (perfil, tema, notificações — conforme itens do roadmap).

---

## 8. Fluxos Principais

### 8.1 Fluxo: Criar Lista e Adicionar Produtos

```
1. Usuário acessa "Minhas Listas" → toca em "Nova Lista"
2. Preenche nome, responsável, tipo, local e data → confirma
3. Sistema cria documento em `listas` com total = 0 e quantidadeItens = 0
4. Usuário toca em "Adicionar Produto"
5. Sistema exibe busca de produtos cadastrados (autocomplete)
   5a. Se o produto não existir → usuário pode cadastrá-lo na hora
6. Usuário informa quantidade e valor unitário → confirma
7. Sistema calcula subtotal e adiciona o item ao array `produtos[]` da lista
8. Sistema recalcula `total` e `quantidadeItens` da lista
9. Sistema grava entrada em `historicoPrecos` para o produto
10. Tela de detalhe da lista é atualizada automaticamente (Angular Signals)
```

### 8.2 Fluxo: Cálculo Automático de Totais

```
Subtotal (item) = Quantidade × Valor Unitário
Total (lista) = Σ Subtotal de todos os itens
Quantidade de Itens (lista) = Σ Quantidade de todos os itens
```

Estes cálculos devem ser reativos: qualquer alteração em um item dispara o recálculo imediato do total da lista, sem necessidade de recarregar a tela.

### 8.3 Fluxo: Atualização do Dashboard

```
1. Sistema consulta todas as `listas` do usuário no período selecionado (ex.: mês corrente)
2. Agrega valores por categoria (via listaProduto.categoriaId)
3. Agrega valores por localCompra
4. Agrega valores por tipo de lista
5. Compara total do mês com metas cadastradas
6. Renderiza gráficos (pizza, linhas, ranking)
```

### 8.4 Fluxo: Definição e Acompanhamento de Metas

```
1. Usuário define meta geral e/ou metas por categoria em "Configurações" ou "Dashboard"
2. Sistema armazena metas vinculadas ao usuário e ao mês de referência
3. A cada nova compra registrada, o sistema recalcula % atingido da meta
4. Dashboard exibe indicador visual (ex.: barra de progresso, alerta ao ultrapassar 100%)
```

### 8.5 Fluxo: Evolução de Preços

```
1. A cada item adicionado a uma lista, sistema grava em `historicoPrecos`
   (produtoId, valor, data)
2. Ao consultar um produto, sistema busca os últimos registros de preço
3. Sistema calcula variação percentual entre a compra mais recente e a anterior
4. Exibe indicador: ⬆ aumento X% ou ⬇ redução X%
```

---

## 9. Regras de Negócio

- **RN01**: Toda lista deve ter ao menos os campos obrigatórios preenchidos (nome, responsável, tipo, local, data) antes de ser criada.
- **RN02**: O subtotal de um item é sempre recalculado automaticamente e não pode ser editado manualmente.
- **RN03**: O total e a quantidade de itens de uma lista são sempre derivados dos itens (não editáveis diretamente).
- **RN04**: Cada item de compra deve pertencer a uma categoria, herdada do produto vinculado (mas pode ser sobrescrita pontualmente, se necessário).
- **RN05**: Ao adicionar um item, o sistema deve gravar automaticamente um registro em `historicoPrecos`.
- **RN06**: Categorias padrão não podem ser excluídas, apenas ocultadas; categorias personalizadas podem ser criadas, editadas e excluídas pelo usuário.
- **RN07**: Metas são definidas por período (mensal) e podem ser gerais ou específicas por categoria.
- **RN08**: A foto da nota fiscal é opcional e, quando enviada, deve ser associada exclusivamente à lista correspondente.
- **RN09**: Relatórios exportados devem refletir os filtros aplicados na tela de origem (ex.: período, categoria).

---

## 10. Requisitos Funcionais

| ID | Requisito |
|---|---|
| RF01 | O sistema deve permitir criar, editar e excluir listas de compras. |
| RF02 | O sistema deve permitir adicionar, editar e remover produtos de uma lista. |
| RF03 | O sistema deve calcular automaticamente subtotais e totais. |
| RF04 | O sistema deve permitir cadastro de produtos reutilizáveis entre listas. |
| RF05 | O sistema deve permitir cadastro de categorias padrão e personalizadas. |
| RF06 | O sistema deve permitir cadastro de locais de compra. |
| RF07 | O sistema deve apresentar um dashboard com gráficos de gastos por categoria, evolução mensal, ranking de produtos e locais. |
| RF08 | O sistema deve permitir definição de metas gerais e por categoria. |
| RF09 | O sistema deve registrar o histórico de preços de cada produto. |
| RF10 | O sistema deve permitir pesquisa de listas no histórico por múltiplos filtros. |
| RF11 | O sistema deve permitir anexar foto da nota fiscal a uma lista. |
| RF12 | O sistema deve gerar relatórios exportáveis em PDF e Excel. |
| RF13 | O sistema deve autenticar usuários via Firebase Authentication. |

---

## 11. Requisitos Não Funcionais

| ID | Requisito |
|---|---|
| RNF01 | O sistema deve ser responsivo, funcionando em dispositivos móveis e desktop. |
| RNF02 | O sistema deve ser instalável como PWA. |
| RNF03 | O sistema deve permitir uso offline básico (visualização e criação de listas), sincronizando ao reconectar. |
| RNF04 | O tempo de resposta para operações de CRUD deve ser inferior a 2 segundos em condições normais de rede. |
| RNF05 | O sistema deve seguir boas práticas de acessibilidade (contraste, navegação por teclado). |
| RNF06 | O sistema deve escalar para múltiplos usuários simultâneos sem degradação perceptível (suportado nativamente pela infraestrutura serverless do Firebase). |
| RNF07 | Os dados do usuário devem ser isolados por regras de segurança do Firestore (um usuário não acessa dados de outro, exceto em funcionalidade futura de multiusuário/família). |

---

## 12. Segurança e Autenticação

- Autenticação via **Firebase Authentication** (e-mail/senha e, futuramente, provedores sociais).
- **Firestore Security Rules** devem garantir que cada usuário só possa ler/escrever seus próprios documentos (`listas`, `produtos`, `categorias` personalizadas, etc.), com base no `uid` autenticado.
- Uploads de imagens (notas fiscais) devem seguir regras equivalentes no **Firebase Storage**, restringindo acesso ao proprietário do arquivo.
- Dados sensíveis (ex.: e-mail) não devem ser expostos em consultas públicas ou logs.

---

## 13. Relatórios e Exportação

O módulo de relatórios deve suportar a geração dos seguintes documentos, com exportação em **PDF** e **Excel**:

1. Gastos por Categoria
2. Gastos por Mercado (local de compra)
3. Evolução Mensal
4. Produtos Mais Comprados
5. Produtos com Maior Aumento de Preço
6. Histórico Completo de Compras

Cada relatório deve permitir filtro por período (mês/intervalo de datas) antes da geração.

---

## 14. Roadmap / Funcionalidades Futuras

- Compartilhamento de listas entre usuários
- Sincronização em tempo real
- Produtos favoritos
- Marcação de itens como "comprado" (checklist)
- Dashboard avançado (novas métricas)
- Modo escuro
- Notificações (ex.: metas próximas do limite)
- Backup automático
- Multiusuário / conta família
- Comparação de gastos por ano
- PWA instalável (reforço/otimização)

---

## 15. Escopo Removido

As seguintes funcionalidades foram avaliadas e **removidas do escopo** do projeto:

- Leitor de código de barras
- Registro de forma de pagamento
- Gestão de promoções

*(Podem ser reavaliadas em versões futuras, mas não fazem parte do desenho atual.)*

---

## 16. Riscos e Considerações Técnicas

| Risco | Impacto | Mitigação |
|---|---|---|
| Modelagem de `listas.produtos[]` como array embutido pode gerar documentos grandes em listas com muitos itens | Médio | Monitorar limite de 1 MB por documento do Firestore; considerar subcoleção `itens` caso listas ultrapassem centenas de produtos |
| Consultas agregadas do Dashboard (somas por categoria/mês) podem ficar custosas conforme o histórico cresce | Médio | Avaliar uso de Cloud Functions para pré-agregação (ex.: documentos de resumo mensal) em vez de cálculo client-side |
| Uso offline com sincronização posterior pode gerar conflitos de escrita | Baixo/Médio | Definir estratégia de resolução de conflito (last-write-wins é o padrão do Firestore) e comunicar claramente ao usuário |
| Geração de PDF/Excel client-side pode impactar performance em dispositivos móveis | Baixo | Avaliar bibliotecas leves (ex.: jsPDF, SheetJS) ou geração via Cloud Function |
| Exposição de custos do Firestore em caso de crescimento do número de leituras (dashboard consulta muitos documentos) | Médio | Implementar cache local e/ou documentos de agregação para reduzir leituras repetidas |

---

*Fim do documento.*