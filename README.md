# Yu-Gi-Oh! Domain Format - Deckmaster Finder

Um buscador de cartas de alta performance e precisão cirúrgica, desenvolvido especificamente para o formato alternativo **Domain** de Yu-Gi-Oh!. A aplicação ajuda jogadores a encontrarem monstros que pertençam ou mencionem Atributos, Tipos e Arquétipos específicos para a construção de seus baralhos e definição de seus *Deckmasters*.

---

## Internacionalização Automática (i18n)

O projeto conta com suporte nativo a múltiplos idiomas (atualmente focado em **Português - Brasil** e **Inglês - EUA**). 
A aplicação detecta automaticamente o idioma padrão do navegador do usuário (`navigator.language`) ao carregar a página e traduz dinamicamente toda a interface: títulos, rótulos, botões, caixas de diálogo (`confirm`/`alert`), placeholders de carregamento e mensagens de status do sistema.

---

## Arquitetura e Solução de Performance

Para lidar com o banco de dados massivo do jogo (~12MB de dados brutos na API pública do *YGOPRODeck*) sem estourar o limite estrito de armazenamento do navegador (contornando o erro `DOMException: The quota has been exceeded` do `localStorage`), o projeto adota uma arquitetura híbrida local:

- **Backend (Node.js + Express):** Funciona como um gerenciador de dados inteligente em segundo plano. Ao ser iniciado, ele verifica se o arquivo físico `cartas.json` existe. Se não existir, ele consome a API externa, filtra apenas os monstros e limpa propriedades pesadas (imagens, preços, etc.), gerando um banco de dados local ultra-otimizado.
- **Front-end (Tailwind CSS v4 + Vanilla JS):** Consome a API do backend local de forma instantânea.
- **Busca por Palavra Inteira (Regex):** A filtragem de efeitos utiliza Expressões Regulares com delimitadores de borda de palavra (`\b`). Isso elimina falsos positivos clássicos (como a carta *Diviner of the Herald* aparecer em buscas pelo atributo *DIVINE* apenas por conter "Divin" no nome).
- **CSS Sprites:** Ícones de atributos unificados em uma única folha de sprites (`atributos-sprite.png`) para zerar requisições HTTP redundantes no carregamento.

---

## Estrutura Final do Repositório

```text
YUGIOH_DOMAIN_FORMAT_DECKMASTER_FINDER/
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── atributos-sprite.png  # Sprite Sheet dos Atributos
│   ├── data/
│   │   └── cartas.json          # Banco de dados gerado automaticamente (Vai ser gerado automaticamente)
│   └── js/
│       ├── i18n.js               # Dicionários de tradução e detecção de idioma
│       └── app.js                # Lógica principal, manipulação do DOM e Regex
├── index.html                    # Interface do usuário estruturada com Tailwind v4
├── server.js                     # Servidor Node.js (API local Express)
├── .gitignore                    # Proteção para node_modules e dados gerados
├── package.json                  # Dependências do projeto (express, cors, node-fetch)
└── README.md                     # Documentação do projeto
``` 

---

## Como Executar o Projeto Localmente
Pré-requisitos:

### Você precisará ter instalado em sua máquina:

  - Node.js (Versão estável mais recente)
  - Uma extensão de servidor estático no seu editor de código (como o Live Server no VS Code)

---

## Passo a Passo para Inicialização

  ### 1: Baixar as dependências do ecossistema Node:
  - Abra o seu terminal na raiz do projeto e execute o comando abaixo para recriar a pasta node_modules:
```text
  npm install
```
  ### 2: Iniciar o Servidor Backend:
  - No mesmo terminal, execute o script do servidor para iniciar a API local:
```text
  node server.js
```
O terminal indicará: Servidor Backend rodando em http://localhost:3000.

  ### 3: Abrir a Interface (Front-end):
  - Abra o arquivo index.html com o seu Live Server (geralmente rodando em http://127.0.0.1:5500).

---

## Sincronização de Novas Coleções

### O jogo recebe novas cartas e arquétipos constantemente. Para atualizar o seu banco de dados local sem precisar mexer em códigos ou scripts externos:

  - Clique no botão "Atualizar Arquivo JSON Local" localizado no cabeçalho da página.

  - Confirme a ação na caixa de diálogo flutuante (que aparecerá no seu idioma nativo).

  - O front-end enviará uma requisição POST para o server.js, que triturará os dados novos da API externa e reescreverá o arquivo cartas.json em tempo real.
