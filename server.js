const express = require('express');
const cors = require('cors');
const yts = require('yt-search');

const app = express();
app.use(cors());
app.use(express.json());

// Rota de busca do site
app.get('/buscar', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Envie o nome ou link da música' });
    }

    try {
        // Realiza a busca no YouTube
        const searchResult = await yts(query);
        const videos = searchResult.videos.slice(0, 5); // Pega os 5 primeiros resultados

        if (videos.length === 0) {
            return res.status(404).json({ error: 'Nenhuma música encontrada' });
        }

        // Formata os resultados com dados da música e links de download via provedores públicos
        const resultados = videos.map(video => ({
            id: video.videoId,
            titulo: video.title,
            duracao: video.timestamp,
            canal: video.author.name,
            capa: video.thumbnail,
            url: video.url,
            // Links para download de áudio/vídeo
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
        res.status(500).json({ error: 'Erro ao processar a busca no servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));