// Sistema de Fluxo Conversacional em Node.js

// ============================================
// VALIDADORES E HELPERS
// ============================================

function validarCPFCNPJ(documento) {
  // Validação fake - apenas verifica se tem 11 ou 14 dígitos
  const numeros = documento.replace(/\D/g, '');
  return numeros.length === 11 || numeros.length === 14;
}

async function buscarCadastroPorDocumento(documento) {
  // Simula uma chamada de API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simula 80% de sucesso
      const sucesso = Math.random() > 0.2;
      
      if (sucesso) {
        resolve({
          sucesso: true,
          dados: {
            nome: 'João da Silva',
            documento: documento,
            email: 'joao@email.com'
          }
        });
      } else {
        resolve({
          sucesso: false,
          mensagem: 'Cadastro não encontrado'
        });
      }
    }, 1000);
  });
}

// ============================================
// ENGINE DE FLUXO
// ============================================

class FluxoEngine {
  constructor() {
    this.sessoes = new Map(); // Armazena sessões de usuários
    this.fluxos = new Map(); // Armazena fluxos disponíveis
  }

  registrarFluxo(nomeFluxo, configFluxo) {
    this.fluxos.set(nomeFluxo, configFluxo);
  }

  iniciarFluxo(usuarioId, nomeFluxo) {
    const fluxo = this.fluxos.get(nomeFluxo);
    if (!fluxo) {
      throw new Error(`Fluxo ${nomeFluxo} não encontrado`);
    }

    this.sessoes.set(usuarioId, {
      fluxoAtual: nomeFluxo,
      stepAtual: fluxo.stepInicial,
      dados: {},
      historico: []
    });

    return this.executarStep(usuarioId);
  }

  async processarMensagem(usuarioId, mensagem) {
    const sessao = this.sessoes.get(usuarioId);
    
    if (!sessao) {
      return {
        mensagem: 'Sessão não encontrada. Inicie um novo atendimento.',
        finalizado: true
      };
    }

    // Armazena a mensagem do usuário
    sessao.dados.ultimaMensagem = mensagem;
    sessao.historico.push({ tipo: 'usuario', mensagem });

    // Executa o step atual com a mensagem do usuário
    return await this.executarStep(usuarioId, mensagem);
  }

  async executarStep(usuarioId, mensagemUsuario = null) {
    const sessao = this.sessoes.get(usuarioId);
    const fluxo = this.fluxos.get(sessao.fluxoAtual);
    const step = fluxo.steps[sessao.stepAtual];

    if (!step) {
      return {
        mensagem: 'Erro: Step não encontrado',
        finalizado: true
      };
    }

    // Executa a ação do step
    const resultado = await step.acao(sessao.dados, mensagemUsuario);

    // Adiciona ao histórico
    if (resultado.mensagem) {
      sessao.historico.push({ tipo: 'bot', mensagem: resultado.mensagem });
    }

    // Verifica se deve finalizar
    if (resultado.finalizar) {
      this.sessoes.delete(usuarioId);
      return {
        mensagem: resultado.mensagem,
        finalizado: true
      };
    }

    // Define o próximo step
    if (resultado.proximoStep) {
      sessao.stepAtual = resultado.proximoStep;
    }

    // Se não aguarda resposta, continua executando
    if (!resultado.aguardarResposta && resultado.proximoStep) {
      return await this.executarStep(usuarioId);
    }

    return {
      mensagem: resultado.mensagem,
      finalizado: false,
      aguardandoResposta: resultado.aguardarResposta
    };
  }

  obterSessao(usuarioId) {
    return this.sessoes.get(usuarioId);
  }
}

// ============================================
// DEFINIÇÃO DO FLUXO DE ATENDIMENTO
// ============================================

const fluxoAtendimento = {
  nome: 'atendimento_cadastro',
  stepInicial: 'solicitarDocumento',
  
  steps: {
    // STEP 1: Solicitar CPF/CNPJ
    solicitarDocumento: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          // Primeira execução - apenas exibe a mensagem
          return {
            mensagem: 'Preciso que você informe o CPF/CNPJ para o qual deseja atendimento',
            aguardarResposta: true
          };
        }

        // Usuário enviou o documento
        const documento = mensagem.trim();
        
        if (!validarCPFCNPJ(documento)) {
          return {
            mensagem: 'CPF/CNPJ inválido. Por favor, informe um documento válido (11 ou 14 dígitos):',
            aguardarResposta: true
          };
        }

        // Armazena o documento
        dados.documento = documento;
        
        return {
          mensagem: null, // Não exibe mensagem aqui
          proximoStep: 'buscarCadastro',
          aguardarResposta: false // Continua automaticamente
        };
      }
    },

    // STEP 2: Buscar cadastro (informativo)
    buscarCadastro: {
      acao: async (dados) => {
        // Mensagem informativa
        const mensagemBusca = 'Aguarde enquanto localizo o cadastro!';
        
        // Busca o cadastro
        const resultado = await buscarCadastroPorDocumento(dados.documento);
        
        dados.resultadoBusca = resultado;

        if (resultado.sucesso) {
          return {
            mensagem: mensagemBusca,
            proximoStep: 'confirmarCadastro',
            aguardarResposta: false // Continua automaticamente
          };
        } else {
          return {
            mensagem: `${mensagemBusca}\n\n❌ Cadastro não encontrado. Por favor, informe outro CPF/CNPJ:`,
            proximoStep: 'solicitarDocumento',
            aguardarResposta: true
          };
        }
      }
    },

    // STEP 3: Confirmar cadastro
    confirmarCadastro: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          // Primeira execução - exibe dados e opções
          const nome = dados.resultadoBusca.dados.nome;
          return {
            mensagem: `✅ Consegui localizar o cadastro em nome de ${nome}\n\nÉ para esse cadastro que você deseja atendimento?\n\n1 - Sim\n2 - Não`,
            aguardarResposta: true
          };
        }

        // Processa a resposta
        const opcao = mensagem.trim();

        if (opcao === '1' || opcao.toLowerCase() === 'sim') {
          return {
            mensagem: null,
            proximoStep: 'finalizar',
            aguardarResposta: false
          };
        } else if (opcao === '2' || opcao.toLowerCase() === 'não' || opcao.toLowerCase() === 'nao') {
          return {
            mensagem: 'Entendido. Por favor, informe outro CPF/CNPJ:',
            proximoStep: 'solicitarDocumento',
            aguardarResposta: true
          };
        } else {
          return {
            mensagem: 'Opção inválida. Por favor, digite:\n1 - Sim\n2 - Não',
            aguardarResposta: true
          };
        }
      }
    },

    // STEP 4: Finalizar
    finalizar: {
      acao: async (dados) => {
        return {
          mensagem: '✅ Obrigado por confirmar seu cadastro, até logo!',
          finalizar: true
        };
      }
    }
  }
};

// ============================================
// EXEMPLO DE OUTRO FLUXO (para demonstrar flexibilidade)
// ============================================

const fluxoSuporte = {
  nome: 'suporte_tecnico',
  stepInicial: 'menuPrincipal',
  
  steps: {
    menuPrincipal: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: '🔧 Suporte Técnico\n\nEscolha uma opção:\n1 - Problema com internet\n2 - Problema com fatura\n3 - Outros',
            aguardarResposta: true
          };
        }

        dados.opcao = mensagem;
        return {
          mensagem: `Você selecionou a opção ${mensagem}. Estamos direcionando você para um atendente...`,
          finalizar: true
        };
      }
    }
  }
};

// ============================================
// SIMULAÇÃO DE INTERFACE DE CHAT
// ============================================

async function simularChat() {
  const engine = new FluxoEngine();
  
  // Registra os fluxos
  engine.registrarFluxo('atendimento_cadastro', fluxoAtendimento);
  engine.registrarFluxo('suporte_tecnico', fluxoSuporte);

  console.log('='.repeat(60));
  console.log('SIMULAÇÃO DE CHATBOT COM FLUXO');
  console.log('='.repeat(60));
  console.log();

  const usuarioId = 'usuario_123';

  // Inicia o fluxo
  console.log('🤖 BOT: Iniciando atendimento...\n');
  let resposta = await engine.iniciarFluxo(usuarioId, 'atendimento_cadastro');
  console.log(`🤖 BOT: ${resposta.mensagem}\n`);

  // Simula interações do usuário
  const mensagensUsuario = [
    '12345678901',        // CPF válido
    // Aqui o bot vai buscar automaticamente
    '1',                  // Confirma o cadastro
  ];

  for (const msg of mensagensUsuario) {
    console.log(`👤 USUÁRIO: ${msg}\n`);
    
    resposta = await engine.processarMensagem(usuarioId, msg);
    
    if (resposta.mensagem) {
      console.log(`🤖 BOT: ${resposta.mensagem}\n`);
    }

    if (resposta.finalizado) {
      console.log('✅ Atendimento finalizado!\n');
      break;
    }

    // Pequena pausa para simular leitura
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(60));
  console.log('HISTÓRICO DA CONVERSA:');
  console.log('='.repeat(60));
  
  // Mostra o histórico (se a sessão ainda existir)
  const sessao = engine.obterSessao(usuarioId);
  if (!sessao) {
    console.log('(Sessão já foi finalizada)');
  }
}

// ============================================
// EXEMPLO DE USO COM EXPRESS (OPCIONAL)
// ============================================

function criarAPIExpress() {
  const express = require('express');
  const app = express();
  const engine = new FluxoEngine();

  // Registra fluxos
  engine.registrarFluxo('atendimento_cadastro', fluxoAtendimento);
  engine.registrarFluxo('suporte_tecnico', fluxoSuporte);

  app.use(express.json());

  // Endpoint para iniciar um fluxo
  app.post('/chat/iniciar', async (req, res) => {
    const { usuarioId, fluxo } = req.body;
    
    try {
      const resposta = await engine.iniciarFluxo(usuarioId, fluxo);
      res.json(resposta);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  });

  // Endpoint para enviar mensagem
  app.post('/chat/mensagem', async (req, res) => {
    const { usuarioId, mensagem } = req.body;
    
    const resposta = await engine.processarMensagem(usuarioId, mensagem);
    res.json(resposta);
  });

  // Endpoint para obter histórico
  app.get('/chat/historico/:usuarioId', (req, res) => {
    const sessao = engine.obterSessao(req.params.usuarioId);
    
    if (!sessao) {
      return res.status(404).json({ erro: 'Sessão não encontrada' });
    }
    
    res.json(sessao.historico);
  });

  return app;
}

// Exporta para uso externo
module.exports = {
  FluxoEngine,
  fluxoAtendimento,
  fluxoSuporte,
  criarAPIExpress
};

// Executa simulação se for chamado diretamente
if (require.main === module) {
  simularChat().catch(console.error);
}
