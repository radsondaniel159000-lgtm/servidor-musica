const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Rota de busca do site
app.get('/buscar', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Envie o nome ou link da música' });
    }
    
    // Retorna a confirmação para a tela do site
    res.json({
        message: 'Busca recebida com sucesso!',
        termo: query,
        status: 'pronto'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));