const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'assets', 'data', 'cartas.json');

function garantirDiretorio(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function sincronizarDadosComAPI() {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    console.log("Buscando dados atualizados da API externa...");
    const resposta = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
    const dados = await resposta.json();

    if (!dados || !dados.data || !Array.isArray(dados.data)) {
        throw new Error("A API externa não retornou os dados no formato esperado ou está fora do ar temporariamente.");
    }

    console.log(`Dados recebidos da API (${dados.data.length} cartas brutas). Otimizando banco de dados...`);

    const cartasOtimizadas = dados.data
        .filter(carta => carta.type && carta.type.toLowerCase().includes('monster'))
        .map(carta => {
            
            //padrao nivel
            let valorEscala = carta.level ?? 0;
            let tipoEscala = 'LV';
            const tipoCarta = carta.frameType;

            // xyz rank
            if (tipoCarta.includes('xyz')) {
                tipoEscala = 'RK';
            } 
            // link rating
            else if (carta.linkval !== undefined && carta.linkval !== null) {
                valorEscala = carta.linkval;
                tipoEscala = 'LK';
            }

            return {
                name: carta.name,
                desc: carta.desc || "",
                attribute: carta.attribute || "",
                race: carta.race || "",
                archetype: carta.archetype || "",
                level: valorEscala,
                levelType: tipoEscala
            };
        });

    garantirDiretorio(FILE_PATH);
    fs.writeFileSync(FILE_PATH, JSON.stringify(cartasOtimizadas, null, 2), 'utf-8');
    console.log(`Sucesso! Arquivo cartas.json atualizado com ${cartasOtimizadas.length} monstros.`);
    return cartasOtimizadas;
}

// inicialização
app.get('/api/cartas', async (req, res) => {
    try {
        if (fs.existsSync(FILE_PATH)) {
            console.log("Servindo dados direto do arquivo cartas.json local.");
            const dadosLocais = fs.readFileSync(FILE_PATH, 'utf-8');
            return res.json(JSON.parse(dadosLocais));
        }

        console.log("Arquivo não encontrado! Iniciando criação automática...");
        const novosDados = await sincronizarDadosComAPI();
        return res.json(novosDados);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Falha ao processar banco de dados local." });
    }
});

// atualização
app.post('/api/cartas/sincronizar', async (req, res) => {
    try {
        console.log("Solicitação recebida: Forçando limpeza do cartas.json...");

        if (fs.existsSync(FILE_PATH)) {
            fs.unlinkSync(FILE_PATH);
            console.log("Arquivo cartas.json antigo deletado com sucesso.");
        }

        const novasCartas = await sincronizarDadosComAPI();

        res.json({
            mensagem: "Banco de dados limpo e atualizado com sucesso!",
            total: novasCartas.length
        });

    } catch (erro) {
        console.error("Erro ao processar sincronização forçada:", erro);
        res.status(500).json({ 
            erro: "Erro interno ao reescrever o banco de dados.", 
            detalhes: erro.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Backend rodando em http://localhost:${PORT}`);
});