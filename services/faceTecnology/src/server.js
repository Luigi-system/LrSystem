const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

// Almacenamiento en memoria
const resultados = [];

// Endpoint para guardar resultados
app.post('/api/resultados', (req, res) => {
  const { expresion, genero, timestamp, imagen } = req.body;
  if (!expresion || !genero || !timestamp) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }
  resultados.push({ expresion, genero, timestamp, imagen });
  res.status(201).json({ mensaje: 'Resultado almacenado correctamente.' });
});

// Endpoint para obtener todos los resultados
app.get('/api/resultados', (req, res) => {
  res.json(resultados);
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});