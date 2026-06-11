let todasAsCartas = []; 
const filtros = {
    attributes: [],
    types: [],
    archetypes: []
};

const selectAttribute = document.getElementById('select-attribute');
const selectType = document.getElementById('select-type');
const selectArchetype = document.getElementById('select-archetype');
const containerAttrTags = document.getElementById('container-attribute-tags');
const containerTypeTags = document.getElementById('container-type-tags');
const containerArchetypeTags = document.getElementById('container-archetype-tags');
const btnBuscar = document.getElementById('btn-buscar');
const statusDiv = document.getElementById('status');
const resultadosDiv = document.getElementById('resultados');

// tradução
function aplicarTraducoesUI() {
    if (document.getElementById('main-title')) {
        document.getElementById('main-title').innerText = txt.titulo;
    }
    if (document.getElementById('main-subtitle')) {
        document.getElementById('main-subtitle').innerText = idiomaAtivo === 'pt' 
            ? "Busque monstros que pertencem ou mencionam Atributos e Tipos específicos." 
            : "Search for monsters that belong to or mention specific Attributes and Types.";
    }
    if (document.getElementById('label-attribute')) {
        document.getElementById('label-attribute').innerText = txt.labelAtributo;
    }
    if (document.getElementById('label-type')) {
        document.getElementById('label-type').innerText = txt.labelTipo;
    }
    if (document.getElementById('label-archetype')) {
        document.getElementById('label-archetype').innerText = txt.labelArquetipo;
    }
    if (btnBuscar) {
        btnBuscar.innerText = txt.btnBuscar;
    }
}

// botao de atualização
const header = document.querySelector('header');
const btnAtualizarLocal = document.createElement('button');
btnAtualizarLocal.className = "mt-3 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 py-1 px-3 rounded border border-gray-600 transition cursor-pointer block mx-auto";
btnAtualizarLocal.id = "btn-atualizar-local";
btnAtualizarLocal.innerText = txt.btnSincronizar;
header.appendChild(btnAtualizarLocal);

async function inicializarAplicacao() {
    aplicarTraducoesUI();
    
    try {
        statusDiv.classList.remove('hidden');
        statusDiv.innerText = txt.statusVerificando;
        btnBuscar.disabled = true;

        // backend local
        const resposta = await fetch('http://localhost:3000/api/cartas');
        todasAsCartas = await resposta.json();

        populaDropdowns();
        
        statusDiv.innerText = txt.statusPronto;
        setTimeout(() => statusDiv.classList.add('hidden'), 1500);
        btnBuscar.disabled = false;

    } catch (erro) {
        console.error("Erro ao inicializar:", erro);
        statusDiv.innerText = txt.statusErroNode;
    }
}

// sincronização manual
btnAtualizarLocal.addEventListener('click', async () => {
    if (!confirm(txt.alertConfirmSinc)) return;

    try {
        statusDiv.classList.remove('hidden');
        statusDiv.innerText = txt.statusSincronizando;
        btnBuscar.disabled = true;

        const resposta = await fetch('http://localhost:3000/api/cartas/sincronizar', { method: 'POST' });
        const resultado = await resposta.json();

        if (resposta.ok) {
            const mensagemSucesso = idiomaAtivo === 'pt'
                ? `${resultado.mensagem} Total de monstros: ${resultado.total}`
                : `${resultado.mensagem} Total monsters: ${resultado.total}`;
            alert(mensagemSucesso);
            
            inicializarAplicacao();
        } else {
            throw new Error(resultado.erro);
        }
    } catch (erro) {
        const mensagemFalha = idiomaAtivo === 'pt' ? "Falha ao sincronizar: " : "Sync failed: ";
        alert(mensagemFalha + erro.message);
        statusDiv.classList.add('hidden');
        btnBuscar.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', inicializarAplicacao);

// dropdowns
function populaDropdowns() {
    const atributosUnicos = new Set();
    const tiposUnicos = new Set();
    const arquetiposUnicos = new Set();

    todasAsCartas.forEach(carta => {
        if (carta.attribute) atributosUnicos.add(carta.attribute.toUpperCase());
        if (carta.race) tiposUnicos.add(carta.race);
        if (carta.archetype) arquetiposUnicos.add(carta.archetype);
    });

    // atributos
    selectAttribute.innerHTML = `<option value="" disabled selected>${txt.placeholderAtributo}</option>`;
    Array.from(atributosUnicos).sort().forEach(attr => {
        const option = document.createElement('option');
        option.value = attr.toLowerCase();
        option.textContent = attr;
        selectAttribute.appendChild(option);
    });
    selectAttribute.disabled = false;

    // tipo
    selectType.innerHTML = `<option value="" disabled selected>${txt.placeholderTipo}</option>`;
    Array.from(tiposUnicos).sort().forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.toLowerCase();
        option.textContent = tipo;
        selectType.appendChild(option);
    });
    selectType.disabled = false;

    // arquetipo
    selectArchetype.innerHTML = `<option value="" disabled selected>${txt.placeholderArquetipo}</option>`;
    Array.from(arquetiposUnicos).sort().forEach(arq => {
        const option = document.createElement('option');
        option.value = arq.toLowerCase();
        option.textContent = arq;
        selectArchetype.appendChild(option);
    });
    selectArchetype.disabled = false;
}

function atualizarTagsUI(tipo) {
    let container = tipo === 'attributes' ? containerAttrTags : (tipo === 'types' ? containerTypeTags : containerArchetypeTags);
    container.innerHTML = '';
    filtros[tipo].forEach(valor => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.innerHTML = `${valor.toUpperCase()} <button onclick="removerTag('${tipo}', '${valor}')">&times;</button>`;
        container.appendChild(tagSpan);
    });
}

function adicionarTag(tipo, valor) {
    if (valor && !filtros[tipo].includes(valor)) {
        filtros[tipo].push(valor);
        atualizarTagsUI(tipo);
    }
}

window.removerTag = function(tipo, valor) {
    filtros[tipo] = filtros[tipo].filter(v => v !== valor);
    atualizarTagsUI(tipo);
}

selectAttribute.addEventListener('change', (e) => { adicionarTag('attributes', e.target.value); e.target.value = ''; });
selectType.addEventListener('change', (e) => { adicionarTag('types', e.target.value); e.target.value = ''; });
selectArchetype.addEventListener('change', (e) => { adicionarTag('archetypes', e.target.value); e.target.value = ''; });

// filtro
btnBuscar.addEventListener('click', () => {
    if (filtros.attributes.length === 0 && filtros.types.length === 0 && filtros.archetypes.length === 0) {
        alert(txt.alertCriterio);
        return;
    }

    statusDiv.classList.remove('hidden');
    statusDiv.innerText = txt.statusFiltrando;
    resultadosDiv.innerHTML = '';

    const cartasFiltradas = todasAsCartas.filter(carta => {
        const texto = carta.desc ? carta.desc.toLowerCase() : "";
        const atributoCarta = carta.attribute ? carta.attribute.toLowerCase() : "";
        const tipoCarta = carta.race ? carta.race.toLowerCase() : ""; 
        const arquetipoCarta = carta.archetype ? carta.archetype.toLowerCase() : "";

        const atendeAtributo = filtros.attributes.length === 0 || filtros.attributes.some(attr => {
            if (atributoCarta === attr) return true;
            return new RegExp(`\\b${attr}\\b`, 'i').test(texto);
        });

        const atendeTipo = filtros.types.length === 0 || filtros.types.some(tipo => {
            if (tipoCarta === tipo) return true;
            return new RegExp(`\\b${tipo}\\b`, 'i').test(texto);
        });

        const atendeArquetipo = filtros.archetypes.length === 0 || filtros.archetypes.some(arq => {
            if (arquetipoCarta === arq) return true;
            const arqEscapado = arq.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            return new RegExp(`\\b${arqEscapado}\\b`, 'i').test(texto);
        });

        return atendeAtributo && atendeTipo && atendeArquetipo;
    });

    renderizarResultados(cartasFiltradas);
    statusDiv.classList.add('hidden');
});

// destaque da presença dos termos buscados
function destacarTermos(texto, filtrosAtivos) {
    if (!texto) return "";
    
    const todosTermos = [
        ...filtrosAtivos.attributes,
        ...filtrosAtivos.types,
        ...filtrosAtivos.archetypes
    ].filter(Boolean);

    if (todosTermos.length === 0) return texto;

    const termosEscapados = todosTermos
        .map(termo => termo.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
        .sort((a, b) => b.length - a.length);

    const regex = new RegExp(`(${termosEscapados.join('|')})`, 'gi');

    return texto.replace(regex, '<b>$1</b>');
}

// render
function renderizarResultados(cartas) {
    if (cartas.length === 0) {
        resultadosDiv.innerHTML = `<p class="text-center text-gray-500 col-span-full">${txt.nenhumaCarta}</p>`;
        return;
    }

    // logica de destaque dos resultados que correspondem a todas as buscas feitas
    const checarDestaquePerfeito = (carta) => {
        const texto = carta.desc ? carta.desc.toLowerCase() : "";
        const atributoCarta = carta.attribute ? carta.attribute.toLowerCase() : "";
        const tipoCarta = carta.race ? carta.race.toLowerCase() : "";

        // Se o usuário não filtrou nada daquela categoria, passa direto
        const bateuTodosAtributos = filtros.attributes.length === 0 || filtros.attributes.every(attr => {
            if (atributoCarta === attr) return true;
            return new RegExp(`\\b${attr}\\b`, 'i').test(texto);
        });

        const bateuTodosTipos = filtros.types.length === 0 || filtros.types.every(tipo => {
            if (tipoCarta === tipo) return true;
            return new RegExp(`\\b${tipo}\\b`, 'i').test(texto);
        });

        // Caso especial para evitar destacar "tudo" se o usuário buscar só por arquétipo vazio
        const usouFiltrosPrincipais = filtros.attributes.length > 0 || filtros.types.length > 0;

        return usouFiltrosPrincipais && bateuTodosAtributos && bateuTodosTipos;
    };

    // ordenação do destaque
    cartas.sort((a, b) => {
        const aEhDestaque = checarDestaquePerfeito(a);
        const bEhDestaque = checarDestaquePerfeito(b);
        if (aEhDestaque && !bEhDestaque) return -1;
        if (!aEhDestaque && bEhDestaque) return 1;
        return 0;
    });

    const textoContador = txt.contadorCartas.replace('{total}', cartas.length);
    resultadosDiv.innerHTML = `<p class="text-sm text-gray-400 col-span-full mb-2">${textoContador}</p>`;

    // render das cartas
    cartas.forEach(carta => {
        const cardElement = document.createElement('div');
        const attrLower = carta.attribute ? carta.attribute.toLowerCase() : '';
        
        // borda para destaque
        const ehDestaque = checarDestaquePerfeito(carta);
        
        cardElement.className = ehDestaque 
            ? 'bg-gray-800 p-5 rounded-lg shadow-md border-l-4 flex flex-col justify-between borda-destaque transition transform hover:scale-102 border-amber-500 ring-1 ring-amber-500/30' // Destaque Dourado/Âmbar para o Match Perfeito
            : 'bg-gray-800 p-5 rounded-lg shadow-md border-l-4 border-blue-500 flex flex-col justify-between transition transform hover:scale-102';

        const tagIconeAtributo = carta.attribute
            ? `<span class="icon-attribute icon-${attrLower}" title="${carta.attribute.toUpperCase()}"></span>`
            : '';

        // nivel
        let tagNivel = '';

        if (carta.level && carta.level > 0) {
            const tipo = carta.levelType || 'LV';
            
            if (tipo === 'RK') {
                tagNivel = `<span class="text-xs font-bold text-yellow-400 bg-gray-950 px-2 py-0.5 rounded border border-yellow-600/70 flex items-center gap-1 w-max shadow" title="Rank">
                    ⬛ RK ${carta.level}
                </span>`;
            } else if (tipo === 'LK') {
                tagNivel = `<span class="text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/50 flex items-center gap-1 w-max shadow" title="Link Rating">
                    🔹 LK ${carta.level}
                </span>`;
            } else {
                tagNivel = `<span class="text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50 flex items-center gap-1 w-max" title="Level">
                    ⭐ LV ${carta.level}
                </span>`;
            }
        }

        cardElement.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-2">
                    ${tagIconeAtributo}
                    ${tagNivel} </div>
                    ${carta.archetype ? `<span class="text-xs font-semibold text-blue-400 block mb-3 uppercase tracking-wider">${carta.archetype}</span>` : ''}
                <h3 class="text-lg font-bold text-white mb-1 leading-tight">${destacarTermos(carta.name, filtros)}</h3>
                ${carta.race ? `<span class="text-xs font-semibold text-white-400 block mb-3 uppercase tracking-wider">${carta.race}</span>` : ''}
                <p class="text-gray-300 text-xs whitespace-pre-line leading-relaxed">${destacarTermos(carta.desc, filtros)}</p>
            </div>
        `;
        resultadosDiv.appendChild(cardElement);
    });
}