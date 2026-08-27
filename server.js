const express = require('express');
const cors = require('cors');
const yts = require('yt-search');
const multer = require('multer');
const Tesseract = require('tesseract.js');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/buscar', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Envie o nome ou link da música' });
    }
    await processarBusca(query, res);
});

app.post('/buscar-imagem', upload.single('imagem'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    try {
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'por+eng');
        const termoLimpo = text.replace(/[\r\n]+/g, ' ').trim();

        if (!termoLimpo) {
            return res.status(400).json({ error: 'Não foi possível ler o texto da imagem.' });
        }

        await processarBusca(termoLimpo, res);
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        res.status(500).json({ error: 'Erro ao ler a imagem no servidor.' });
    }
});

async function processarBusca(query, res) {
    try {
        const searchResult = await yts(query);
        const videos = searchResult.videos.slice(0, 5);

        if (videos.length === 0) {
            return res.status(404).json({ error: 'Nenhuma música encontrada' });
        }

        const resultados = videos.map(video => ({
            id: video.videoId,
            titulo: video.title,
            duracao: video.timestamp,
            canal: video.author.name,
            capa: video.thumbnail,
            url: video.url,
            linkMp3: `https://api.vevioz.com/api/button/mp3/${video.videoId}`,
            linkMp4: `https://api.vevioz.com/api/button/videos/${video.videoId}`
        }));

        res.json({
            status: 'sucesso',
            termo: query,
            resultados: resultados
        });
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({ error: 'Erro ao processar a busca no servidor.' });
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
