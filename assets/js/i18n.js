const traducoes = {
    pt: {
        titulo: "Yu-Gi-Oh! Domain Format - Deckmaster Finder",
        labelAtributo: "Atributos (Selecione um ou mais):",
        placeholderAtributo: "Escolha um atributo...",
        labelTipo: "Tipos (Selecione um ou mais):",
        placeholderTipo: "Escolha um tipo...",
        labelArquetipo: "Arquétipos (Selecione um ou mais):",
        placeholderArquetipo: "Escolha um arquétipo...",
        btnBuscar: "Buscar Cartas",
        btnSincronizar: "Atualizar Arquivo JSON Local (Sincronizar com API)",
        statusVerificando: "Verificando/Carregando banco de dados local...",
        statusPronto: "Aplicação pronta para buscas!",
        statusFiltrando: "A filtrar com precisão...",
        statusErroNode: "Erro: Certifique-se de que o servidor local (node server.js) está rodando.",
        alertCriterio: "Por favor, selecione pelo menos um critério para buscar.",
        alertConfirmSinc: "Deseja forçar o servidor local a rebaixar os dados atualizados da API externa?",
        statusSincronizando: "Servidor local atualizando o arquivo cartas.json (Aguarde)...",
        nenhumaCarta: "Nenhuma carta encontrada para esses critérios.",
        contadorCartas: "Foram encontradas <strong>{total}</strong> cartas."
    },
    en: {
        titulo: "Yu-Gi-Oh! Domain Format - Deckmaster Finder",
        labelAtributo: "Attributes (Select one or more):",
        placeholderAtributo: "Choose an attribute...",
        labelTipo: "Types (Select one or more):",
        placeholderTipo: "Choose a type...",
        labelArquetipo: "Archetypes (Select one or more):",
        placeholderArquetipo: "Choose an archetype...",
        btnBuscar: "Search Cards",
        btnSincronizar: "Update Local JSON File (Sync with API)",
        statusVerificando: "Checking/Loading local database...",
        statusPronto: "Application ready for search!",
        statusFiltrando: "Filtering precisely...",
        statusErroNode: "Error: Make sure the local server (node server.js) is running.",
        alertCriterio: "Please select at least one criterion to search.",
        alertConfirmSinc: "Do you want to force the local server to redownload updated data from the external API?",
        statusSincronizando: "Local server updating cartas.json file (Please wait)...",
        nenhumaCarta: "No cards found for these criteria.",
        contadorCartas: "Found <strong>{total}</strong> cards."
    }
};

// Detecta o idioma do navegador 
const idiomaNavegador = navigator.language || navigator.userLanguage;
const idiomaAtivo = idiomaNavegador.startsWith('pt') ? 'pt' : 'en';

// Exporta as strings do idioma escolhido para uso global
const txt = traducoes[idiomaAtivo];