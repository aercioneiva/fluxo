CREATE TABLE `user_flow` (
  `id` uuid NOT NULL,
  `contract` uuid NOT NULL,
  `current_flow` varchar(50) NOT NULL,
  `current_step` varchar(50) NOT NULL,
  `data` json NOT NULL,
  `history` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

# 🤖 Sistema de Fluxo Conversacional - Node.js

Sistema flexível e escalável para criar fluxos conversacionais (chatbot) com facilidade.

## 📋 Características

- ✅ **Fluxos Flexíveis**: Crie novos fluxos facilmente
- ✅ **Steps Informativos**: Steps podem ser apenas informativos (sem aguardar resposta)
- ✅ **Validações**: Sistema de validação integrado
- ✅ **API REST**: Endpoints prontos para integração
- ✅ **Armazenamento em Memória**: Não precisa de banco de dados para testes
- ✅ **Histórico**: Mantém histórico completo da conversa

## 🚀 Como Usar

### 1. Instalação

```bash
npm install
```

### 2. Executar Simulação no Console

```bash
npm start
```

Isso vai rodar uma simulação completa do fluxo de atendimento no console.

### 3. Executar API HTTP

```bash
npm run server
```

Acesse: http://localhost:3000

## 📝 Como o Fluxo Funciona

### Fluxo de Atendimento (Implementado)

```
1. Solicitar CPF/CNPJ
   ↓ (aguarda resposta do usuário)
   
2. Validar CPF/CNPJ
   ↓ (se inválido, volta para 1)
   
3. Buscar Cadastro (informativo - não aguarda)
   ↓ (se não encontrado, volta para 1)
   
4. Confirmar Cadastro
   ↓ (aguarda resposta: 1-Sim ou 2-Não)
   
5. Finalizar (se Sim) ou Voltar para 1 (se Não)
```

## 🎯 Como Criar um Novo Fluxo

### Estrutura Básica

```javascript
const meuNovoFluxo = {
  nome: 'nome_do_fluxo',
  stepInicial: 'primeiroStep',
  
  steps: {
    primeiroStep: {
      acao: async (dados, mensagem) => {
        // Lógica do step
        
        return {
          mensagem: 'Mensagem para o usuário',
          aguardarResposta: true,  // ou false para continuar automaticamente
          proximoStep: 'proximoStep', // ou null para ficar no mesmo
          finalizar: false  // ou true para encerrar o fluxo
        };
      }
    },
    
    proximoStep: {
      acao: async (dados, mensagem) => {
        // ...
      }
    }
  }
};

// Registrar o fluxo
engine.registrarFluxo('nome_do_fluxo', meuNovoFluxo);
```

### Retorno da Ação do Step

| Propriedade | Tipo | Descrição |
|------------|------|-----------|
| `mensagem` | string \| null | Mensagem a ser exibida ao usuário |
| `aguardarResposta` | boolean | Se deve aguardar resposta do usuário |
| `proximoStep` | string \| null | Nome do próximo step |
| `finalizar` | boolean | Se deve finalizar o fluxo |

## 💡 Exemplos de Steps

### Step Informativo (não aguarda resposta)

```javascript
stepProcessando: {
  acao: async (dados) => {
    // Faz algum processamento
    await processarDados(dados.documento);
    
    return {
      mensagem: 'Processando seus dados...',
      aguardarResposta: false,  // Continua automaticamente
      proximoStep: 'proximoStep'
    };
  }
}
```

### Step com Validação

```javascript
stepColetarEmail: {
  acao: async (dados, mensagem) => {
    if (!mensagem) {
      return {
        mensagem: 'Por favor, informe seu e-mail:',
        aguardarResposta: true
      };
    }
    
    // Valida o email
    if (!mensagem.includes('@')) {
      return {
        mensagem: 'E-mail inválido. Tente novamente:',
        aguardarResposta: true
      };
    }
    
    dados.email = mensagem;
    
    return {
      mensagem: 'E-mail registrado com sucesso!',
      proximoStep: 'proximoStep',
      aguardarResposta: false
    };
  }
}
```

### Step com Múltiplas Opções

```javascript
stepMenu: {
  acao: async (dados, mensagem) => {
    if (!mensagem) {
      return {
        mensagem: 'Escolha uma opção:\n1 - Opção A\n2 - Opção B\n3 - Opção C',
        aguardarResposta: true
      };
    }
    
    switch(mensagem) {
      case '1':
        return { proximoStep: 'stepOpcaoA', aguardarResposta: false };
      case '2':
        return { proximoStep: 'stepOpcaoB', aguardarResposta: false };
      case '3':
        return { proximoStep: 'stepOpcaoC', aguardarResposta: false };
      default:
        return {
          mensagem: 'Opção inválida. Digite 1, 2 ou 3:',
          aguardarResposta: true
        };
    }
  }
}
```

### Step com Chamada de API

```javascript
stepBuscarDados: {
  acao: async (dados) => {
    try {
      const resposta = await fetch('https://api.exemplo.com/dados');
      const resultado = await resposta.json();
      
      dados.dadosAPI = resultado;
      
      return {
        mensagem: 'Dados encontrados!',
        proximoStep: 'stepExibirDados',
        aguardarResposta: false
      };
    } catch (error) {
      return {
        mensagem: 'Erro ao buscar dados. Tente novamente.',
        proximoStep: 'stepInicial',
        aguardarResposta: false
      };
    }
  }
}
```

## 🌐 Endpoints da API

### GET /fluxos
Lista todos os fluxos disponíveis

**Resposta:**
```json
{
  "fluxos": ["atendimento_cadastro", "suporte_tecnico"]
}
```

### POST /chat/iniciar
Inicia um novo fluxo para um usuário

**Body:**
```json
{
  "usuarioId": "user123",
  "fluxo": "atendimento_cadastro"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Preciso que você informe o CPF/CNPJ...",
  "finalizado": false,
  "aguardandoResposta": true
}
```

### POST /chat/mensagem
Envia uma mensagem do usuário

**Body:**
```json
{
  "usuarioId": "user123",
  "mensagem": "12345678901"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Aguarde enquanto localizo o cadastro!",
  "finalizado": false,
  "aguardandoResposta": false
}
```

### GET /chat/historico/:usuarioId
Retorna o histórico completo da conversa

**Resposta:**
```json
{
  "fluxo": "atendimento_cadastro",
  "stepAtual": "confirmarCadastro",
  "historico": [
    {
      "tipo": "bot",
      "mensagem": "Preciso que você informe o CPF/CNPJ..."
    },
    {
      "tipo": "usuario",
      "mensagem": "12345678901"
    }
  ],
  "dados": {
    "documento": "12345678901"
  }
}
```

### DELETE /chat/reset/:usuarioId
Reseta a sessão do usuário

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Sessão resetada com sucesso"
}
```

## 📚 Exemplo Completo: Criar Fluxo de Agendamento

```javascript
const fluxoAgendamento = {
  nome: 'agendamento_consulta',
  stepInicial: 'menuEspecialidades',
  
  steps: {
    menuEspecialidades: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: 'Escolha a especialidade:\n1 - Cardiologia\n2 - Dermatologia\n3 - Ortopedia',
            aguardarResposta: true
          };
        }
        
        const especialidades = {
          '1': 'Cardiologia',
          '2': 'Dermatologia',
          '3': 'Ortopedia'
        };
        
        dados.especialidade = especialidades[mensagem];
        
        if (!dados.especialidade) {
          return {
            mensagem: 'Opção inválida. Digite 1, 2 ou 3:',
            aguardarResposta: true
          };
        }
        
        return {
          mensagem: null,
          proximoStep: 'buscarHorarios',
          aguardarResposta: false
        };
      }
    },
    
    buscarHorarios: {
      acao: async (dados) => {
        // Simula busca de horários
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dados.horariosDisponiveis = [
          '10:00', '14:00', '16:00'
        ];
        
        return {
          mensagem: 'Buscando horários disponíveis...',
          proximoStep: 'selecionarHorario',
          aguardarResposta: false
        };
      }
    },
    
    selecionarHorario: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          const opcoes = dados.horariosDisponiveis
            .map((h, i) => `${i+1} - ${h}`)
            .join('\n');
          
          return {
            mensagem: `Horários disponíveis:\n${opcoes}`,
            aguardarResposta: true
          };
        }
        
        const indice = parseInt(mensagem) - 1;
        const horario = dados.horariosDisponiveis[indice];
        
        if (!horario) {
          return {
            mensagem: 'Opção inválida. Tente novamente:',
            aguardarResposta: true
          };
        }
        
        dados.horario = horario;
        
        return {
          mensagem: null,
          proximoStep: 'confirmar',
          aguardarResposta: false
        };
      }
    },
    
    confirmar: {
      acao: async (dados) => {
        return {
          mensagem: `✅ Agendamento confirmado!\n\nEspecialidade: ${dados.especialidade}\nHorário: ${dados.horario}`,
          finalizar: true
        };
      }
    }
  }
};

// Registrar
engine.registrarFluxo('agendamento_consulta', fluxoAgendamento);
```

## 🔧 Testando com cURL

```bash
# 1. Iniciar fluxo
curl -X POST http://localhost:3000/chat/iniciar \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"user123","fluxo":"atendimento_cadastro"}'

# 2. Enviar CPF
curl -X POST http://localhost:3000/chat/mensagem \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"user123","mensagem":"12345678901"}'

# 3. Confirmar cadastro (opção 1 = Sim)
curl -X POST http://localhost:3000/chat/mensagem \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"user123","mensagem":"1"}'

# 4. Ver histórico
curl http://localhost:3000/chat/historico/user123
```

## 📊 Dados Armazenados na Sessão

Cada sessão de usuário contém:

```javascript
{
  fluxoAtual: 'nome_do_fluxo',
  stepAtual: 'step_atual',
  dados: {
    // Dados coletados durante o fluxo
    documento: '12345678901',
    email: 'usuario@email.com',
    // etc...
  },
  historico: [
    { tipo: 'bot', mensagem: '...' },
    { tipo: 'usuario', mensagem: '...' }
  ]
}
```

## 🎨 Personalizações

### Adicionar Persistência (MongoDB, Redis, etc.)

Basta modificar a classe `FluxoEngine` para salvar/carregar sessões de um banco:

```javascript
async iniciarFluxo(usuarioId, nomeFluxo) {
  // Verificar se existe sessão no banco
  const sessaoExistente = await db.sessoes.findOne({ usuarioId });
  
  if (sessaoExistente) {
    this.sessoes.set(usuarioId, sessaoExistente);
  } else {
    // Criar nova sessão
    const novaSessao = { /* ... */ };
    await db.sessoes.insertOne(novaSessao);
    this.sessoes.set(usuarioId, novaSessao);
  }
}
```

### Integrar com WhatsApp, Telegram, etc.

Use os métodos `iniciarFluxo()` e `processarMensagem()` dentro dos webhooks:

```javascript
// Exemplo com WhatsApp (baileys, venom, etc.)
client.on('message', async (message) => {
  const usuarioId = message.from;
  const texto = message.body;
  
  // Se é primeira mensagem, inicia fluxo
  if (!engine.obterSessao(usuarioId)) {
    const resposta = await engine.iniciarFluxo(usuarioId, 'atendimento_cadastro');
    await client.sendText(usuarioId, resposta.mensagem);
  } else {
    // Processa mensagem
    const resposta = await engine.processarMensagem(usuarioId, texto);
    await client.sendText(usuarioId, resposta.mensagem);
  }
});
```

## 📝 Licença

MIT

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
