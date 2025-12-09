const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let estudantes = [];
let vagas = [
  { id: 1, titulo: 'Estágio em Desenvolvimento', descricao: 'Desenvolvimento web', aberta: true },
  { id: 2, titulo: 'Estágio em QA', descricao: 'Testes e qualidade', aberta: true }
];

app.post('/api/estudantes/registro', (req, res) => {
  const body = req.body;
  const id = estudantes.length + 1;
  const estudante = { id, ...body };
  estudantes.push(estudante);
  res.status(201).json(estudante);
});

app.post('/api/empresas/registro', (req, res) => {
  const empresa = { id: Date.now(), ...req.body };
  res.status(201).json(empresa);
});

app.get('/api/vagas-estagio/abertas', (req, res) => {
  res.json(vagas.filter(v => v.aberta));
});

app.post('/api/inscricoes', (req, res) => {
  const inscr = { id: Date.now(), ...req.body };
  res.status(201).json(inscr);
});

app.get('/api/areas-interesse', (req, res) => {
  res.json([
    { id: 1, nome: 'Desenvolvimento' },
    { id: 2, nome: 'Design' }
  ]);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Mock server running on http://localhost:${port}`));
