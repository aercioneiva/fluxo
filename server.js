const express = require('express');
const { FluxoEngine } = require('./chatbot-flow');
const { fluxoAtendimentoRBX } = require('./rbx-flow');

const app = express();
const engine = new FluxoEngine();

// Registra os fluxos disponíveis
engine.registrarFluxo('atendimento_rbx', fluxoAtendimentoRBX);

app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


// Listar fluxos disponíveis
app.get('/fluxos', (req, res) => {
  const fluxosDisponiveis = Array.from(engine.fluxos.keys());
  res.json({ fluxos: fluxosDisponiveis });
});

// Iniciar um novo fluxo
app.post('/chat/iniciar', async (req, res) => {
  const { usuarioId, fluxo, contract } = req.body;
  
  if (!usuarioId || !fluxo || !contract) {
    return res.status(400).json({ 
      erro: 'usuarioId, fluxo e contract são obrigatórios' 
    });
  }
  
  try {
    console.log(`Iniciando fluxo "${fluxo}" para usuário "${usuarioId}" com contract "${contract}"`);  
    const resposta = await engine.iniciarFluxo(usuarioId, fluxo, contract);
    res.json({
      sucesso: true,
      ...resposta
    });
  } catch (error) {
    res.status(400).json({ 
      sucesso: false,
      erro: error.message 
    });
  }
});

// Enviar mensagem
app.post('/chat/mensagem', async (req, res) => {
  const { usuarioId, mensagem } = req.body;
  
  if (!usuarioId || !mensagem) {
    return res.status(400).json({ 
      erro: 'usuarioId e mensagem são obrigatórios' 
    });
  }
  
  try {
    const resposta = await engine.processarMensagem(usuarioId, mensagem);
    res.json({
      sucesso: true,
      ...resposta
    });
  } catch (error) {
    res.status(500).json({ 
      sucesso: false,
      erro: error.message 
    });
  }
});

// Obter histórico da conversa
app.get('/chat/historico/:usuarioId', (req, res) => {
  const sessao = engine.obterSessao(req.params.usuarioId);
  
  if (!sessao) {
    return res.status(404).json({ 
      erro: 'Sessão não encontrada ou já finalizada' 
    });
  }
  
  res.json({
    fluxo: sessao.fluxoAtual,
    stepAtual: sessao.stepAtual,
    historico: sessao.historico,
    dados: sessao.dados
  });
});

// Resetar sessão do usuário
app.delete('/chat/reset/:usuarioId', (req, res) => {
  const { usuarioId } = req.params;
  const sessaoExistia = engine.sessoes.has(usuarioId);
  
  engine.sessoes.delete(usuarioId);
  
  res.json({ 
    sucesso: true,
    mensagem: sessaoExistia 
      ? 'Sessão resetada com sucesso' 
      : 'Nenhuma sessão ativa encontrada'
  });
});

// Página HTML simples para testar
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chatbot Flow - API</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          border-bottom: 3px solid #007bff;
          padding-bottom: 10px;
        }
        .endpoint {
          background: #f8f9fa;
          padding: 15px;
          margin: 15px 0;
          border-left: 4px solid #007bff;
          border-radius: 4px;
        }
        .method {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          margin-right: 10px;
          font-size: 12px;
        }
        .get { background: #28a745; color: white; }
        .post { background: #007bff; color: white; }
        .delete { background: #dc3545; color: white; }
        code {
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        .example {
          background: #e7f3ff;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 14px;
        }
        pre {
          background: #2d2d2d;
          color: #f8f8f2;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Chatbot Flow System - API</h1>
        <p>Sistema flexível de fluxos conversacionais. Use os endpoints abaixo para interagir:</p>
        
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/fluxos</code>
          <p>Lista todos os fluxos disponíveis</p>
        </div>

        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/chat/iniciar</code>
          <p>Inicia um novo fluxo para um usuário</p>
          <div class="example">
            <strong>Body:</strong>
            <pre>{ 
  "usuarioId": "user123",
  "fluxo": "atendimento_cadastro"
}</pre>
          </div>
        </div>

        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/chat/mensagem</code>
          <p>Envia uma mensagem do usuário</p>
          <div class="example">
            <strong>Body:</strong>
            <pre>{
  "usuarioId": "user123",
  "mensagem": "12345678901"
}</pre>
          </div>
        </div>

        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/chat/historico/:usuarioId</code>
          <p>Retorna o histórico completo da conversa</p>
        </div>

        <div class="endpoint">
          <span class="method delete">DELETE</span>
          <code>/chat/reset/:usuarioId</code>
          <p>Reseta a sessão do usuário</p>
        </div>

        <hr style="margin: 30px 0;">
        
        <h2>📝 Exemplo de Uso com cURL:</h2>
        <pre>
# 1. Iniciar fluxo
curl -X POST http://localhost:3000/chat/iniciar \\
  -H "Content-Type: application/json" \\
  -d '{"usuarioId":"user123","fluxo":"atendimento_cadastro"}'

# 2. Enviar CPF
curl -X POST http://localhost:3000/chat/mensagem \\
  -H "Content-Type: application/json" \\
  -d '{"usuarioId":"user123","mensagem":"12345678901"}'

# 3. Confirmar cadastro
curl -X POST http://localhost:3000/chat/mensagem \\
  -H "Content-Type: application/json" \\
  -d '{"usuarioId":"user123","mensagem":"1"}'
        </pre>
      </div>
    </body>
    </html>
  `);
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    erro: 'Erro interno do servidor',
    detalhes: err.message 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n✅ Fluxos registrados:');
  engine.fluxos.forEach((fluxo, nome) => {
    console.log(`   - ${nome}`);
  });
  console.log('\n');
});

module.exports = app;
