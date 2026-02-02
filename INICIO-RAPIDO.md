# 🚀 Guia Rápido de Início

## Instalação Rápida

```bash
npm install
```

## Executar Exemplos

### 1. Testar o Fluxo Principal (Atendimento com CPF/CNPJ)
```bash
npm start
```

### 2. Testar Todos os Exemplos
```bash
npm test
```

### 3. Testar Exemplos Específicos
```bash
npm run test:pesquisa      # Pesquisa de Satisfação
npm run test:rastreamento  # Rastreamento de Pedido
npm run test:cadastro      # Cadastro Completo
npm run test:agendamento   # Agendamento de Serviço
```

### 4. Iniciar API HTTP
```bash
npm run server
```

Acesse: http://localhost:3000

## 📋 Estrutura de Arquivos

```
├── chatbot-flow.js          # Engine principal + Fluxo de atendimento
├── exemplos-fluxos.js       # 4 fluxos de exemplo completos
├── testar-exemplos.js       # Testes automatizados
├── server.js                # API REST com Express
├── package.json             # Dependências
└── README.md                # Documentação completa
```

## 🎯 Como Criar Seu Próprio Fluxo em 3 Passos

### Passo 1: Defina a estrutura

```javascript
const meuFluxo = {
  nome: 'nome_do_fluxo',
  stepInicial: 'primeiroStep',
  steps: {}
};
```

### Passo 2: Adicione os steps

```javascript
steps: {
  primeiroStep: {
    acao: async (dados, mensagem) => {
      if (!mensagem) {
        // Primeira vez - exibe pergunta
        return {
          mensagem: 'Qual é seu nome?',
          aguardarResposta: true
        };
      }
      
      // Processar resposta
      dados.nome = mensagem;
      
      return {
        proximoStep: 'proximoStep',
        aguardarResposta: false
      };
    }
  }
}
```

### Passo 3: Registre e use

```javascript
const { FluxoEngine } = require('./chatbot-flow');

const engine = new FluxoEngine();
engine.registrarFluxo('meu_fluxo', meuFluxo);

// Iniciar
await engine.iniciarFluxo('usuario123', 'meu_fluxo');

// Processar mensagem
await engine.processarMensagem('usuario123', 'João');
```

## 🔥 Casos de Uso

### Step Informativo (não aguarda resposta)
```javascript
stepProcessando: {
  acao: async (dados) => {
    await processarDados();
    return {
      mensagem: 'Processando...',
      aguardarResposta: false,
      proximoStep: 'proximo'
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
        mensagem: 'Digite seu email:',
        aguardarResposta: true
      };
    }
    
    if (!mensagem.includes('@')) {
      return {
        mensagem: 'Email inválido!',
        aguardarResposta: true
      };
    }
    
    dados.email = mensagem;
    return { proximoStep: 'proximo' };
  }
}
```

### Step com Menu
```javascript
stepMenu: {
  acao: async (dados, mensagem) => {
    if (!mensagem) {
      return {
        mensagem: '1-Opção A\n2-Opção B',
        aguardarResposta: true
      };
    }
    
    if (mensagem === '1') {
      return { proximoStep: 'opcaoA' };
    } else if (mensagem === '2') {
      return { proximoStep: 'opcaoB' };
    }
    
    return {
      mensagem: 'Opção inválida!',
      aguardarResposta: true
    };
  }
}
```

## 🌐 API REST - Endpoints Principais

### Iniciar Conversa
```bash
curl -X POST http://localhost:3000/chat/iniciar \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"user123","fluxo":"atendimento_cadastro"}'
```

### Enviar Mensagem
```bash
curl -X POST http://localhost:3000/chat/mensagem \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"user123","mensagem":"Sua mensagem"}'
```

### Ver Histórico
```bash
curl http://localhost:3000/chat/historico/user123
```

## 💡 Dicas

1. **Steps Informativos**: Use `aguardarResposta: false` para steps que não precisam de resposta do usuário
2. **Validações**: Sempre valide a entrada antes de avançar para o próximo step
3. **Fluxo Circular**: Você pode voltar para steps anteriores usando `proximoStep`
4. **Dados Persistentes**: Use o objeto `dados` para armazenar informações durante o fluxo
5. **Finalização**: Use `finalizar: true` para encerrar o fluxo

## 📚 Próximos Passos

- Leia o [README.md](README.md) completo para mais detalhes
- Explore os exemplos em [exemplos-fluxos.js](exemplos-fluxos.js)
- Teste a API em http://localhost:3000

## 🤝 Precisa de Ajuda?

Consulte os exemplos incluídos:
- ✅ Fluxo de Atendimento (principal)
- ✅ Pesquisa de Satisfação
- ✅ Rastreamento de Pedido
- ✅ Cadastro Completo
- ✅ Agendamento de Serviço
