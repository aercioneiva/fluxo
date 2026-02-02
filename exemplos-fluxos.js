// EXEMPLOS DE FLUXOS ADICIONAIS

// ============================================
// EXEMPLO 1: Fluxo de Pesquisa de Satisfação
// ============================================

const fluxoPesquisaSatisfacao = {
  nome: 'pesquisa_satisfacao',
  stepInicial: 'introducao',
  
  steps: {
    // Step informativo (não aguarda resposta)
    introducao: {
      acao: async (dados) => {
        return {
          mensagem: '📊 Obrigado por usar nossos serviços!\n\nVamos fazer uma pesquisa rápida de satisfação.',
          aguardarResposta: false,
          proximoStep: 'perguntaNota'
        };
      }
    },
    
    perguntaNota: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: 'De 0 a 10, qual nota você daria para nosso atendimento?',
            aguardarResposta: true
          };
        }
        
        const nota = parseInt(mensagem);
        
        if (isNaN(nota) || nota < 0 || nota > 10) {
          return {
            mensagem: 'Por favor, digite uma nota entre 0 e 10:',
            aguardarResposta: true
          };
        }
        
        dados.nota = nota;
        
        // Se nota baixa, pede feedback
        if (nota < 7) {
          return {
            mensagem: null,
            proximoStep: 'feedbackNegativo',
            aguardarResposta: false
          };
        }
        
        return {
          mensagem: null,
          proximoStep: 'agradecimento',
          aguardarResposta: false
        };
      }
    },
    
    feedbackNegativo: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: 'Que pena! Pode nos dizer o que podemos melhorar?',
            aguardarResposta: true
          };
        }
        
        dados.feedback = mensagem;
        
        return {
          mensagem: null,
          proximoStep: 'agradecimento',
          aguardarResposta: false
        };
      }
    },
    
    agradecimento: {
      acao: async (dados) => {
        let mensagem = `✅ Obrigado pelo seu feedback!\n\nNota: ${dados.nota}/10`;
        
        if (dados.feedback) {
          mensagem += `\n\nVamos trabalhar para melhorar os pontos mencionados.`;
        }
        
        return {
          mensagem,
          finalizar: true
        };
      }
    }
  }
};

// ============================================
// EXEMPLO 2: Fluxo de Rastreamento de Pedido
// ============================================

const fluxoRastreamento = {
  nome: 'rastreamento_pedido',
  stepInicial: 'solicitarPedido',
  
  steps: {
    solicitarPedido: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: '📦 Rastreamento de Pedido\n\nPor favor, informe o número do seu pedido:',
            aguardarResposta: true
          };
        }
        
        // Validação simples
        if (mensagem.length < 5) {
          return {
            mensagem: 'Número de pedido inválido. Digite novamente:',
            aguardarResposta: true
          };
        }
        
        dados.numeroPedido = mensagem;
        
        return {
          mensagem: null,
          proximoStep: 'buscarPedido',
          aguardarResposta: false
        };
      }
    },
    
    buscarPedido: {
      acao: async (dados) => {
        // Simula busca na API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simula resultado aleatório
        const status = ['Em processamento', 'Enviado', 'Em trânsito', 'Saiu para entrega'];
        const statusAleatorio = status[Math.floor(Math.random() * status.length)];
        
        dados.status = statusAleatorio;
        dados.previsaoEntrega = '25/01/2026';
        
        return {
          mensagem: '🔍 Buscando informações do pedido...',
          proximoStep: 'exibirStatus',
          aguardarResposta: false
        };
      }
    },
    
    exibirStatus: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          const msg = `✅ Pedido encontrado!\n\nNúmero: ${dados.numeroPedido}\nStatus: ${dados.status}\nPrevisão de entrega: ${dados.previsaoEntrega}\n\nDeseja rastrear outro pedido?\n1 - Sim\n2 - Não`;
          
          return {
            mensagem: msg,
            aguardarResposta: true
          };
        }
        
        if (mensagem === '1') {
          // Limpa dados e volta ao início
          delete dados.numeroPedido;
          delete dados.status;
          
          return {
            mensagem: null,
            proximoStep: 'solicitarPedido',
            aguardarResposta: false
          };
        }
        
        return {
          mensagem: 'Obrigado por usar nosso serviço de rastreamento!',
          finalizar: true
        };
      }
    }
  }
};

// ============================================
// EXEMPLO 3: Fluxo de Cadastro Completo
// ============================================

const fluxoCadastroCompleto = {
  nome: 'cadastro_completo',
  stepInicial: 'bemVindo',
  
  steps: {
    bemVindo: {
      acao: async () => {
        return {
          mensagem: '👋 Bem-vindo!\n\nVamos fazer seu cadastro completo.',
          aguardarResposta: false,
          proximoStep: 'coletarNome'
        };
      }
    },
    
    coletarNome: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: 'Qual é o seu nome completo?',
            aguardarResposta: true
          };
        }
        
        if (mensagem.trim().split(' ').length < 2) {
          return {
            mensagem: 'Por favor, informe seu nome completo:',
            aguardarResposta: true
          };
        }
        
        dados.nome = mensagem;
        
        return {
          mensagem: null,
          proximoStep: 'coletarEmail',
          aguardarResposta: false
        };
      }
    },
    
    coletarEmail: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: 'Qual é o seu e-mail?',
            aguardarResposta: true
          };
        }
        
        // Validação simples de email
        if (!mensagem.includes('@') || !mensagem.includes('.')) {
          return {
            mensagem: 'E-mail inválido. Tente novamente:',
            aguardarResposta: true
          };
        }
        
        dados.email = mensagem;
        
        return {
          mensagem: null,
          proximoStep: 'coletarTelefone',
          aguardarResposta: false
        };
      }
    },
    
    coletarTelefone: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: 'Qual é o seu telefone? (apenas números)',
            aguardarResposta: true
          };
        }
        
        const numeros = mensagem.replace(/\D/g, '');
        
        if (numeros.length < 10 || numeros.length > 11) {
          return {
            mensagem: 'Telefone inválido. Digite apenas os números (DDD + número):',
            aguardarResposta: true
          };
        }
        
        dados.telefone = numeros;
        
        return {
          mensagem: null,
          proximoStep: 'validandoDados',
          aguardarResposta: false
        };
      }
    },
    
    validandoDados: {
      acao: async (dados) => {
        // Simula validação/processamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          mensagem: '⏳ Validando seus dados...',
          proximoStep: 'confirmarDados',
          aguardarResposta: false
        };
      }
    },
    
    confirmarDados: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          const resumo = `
✅ Dados coletados:

Nome: ${dados.nome}
E-mail: ${dados.email}
Telefone: ${dados.telefone}

Os dados estão corretos?
1 - Sim, confirmar
2 - Não, corrigir nome
3 - Não, corrigir e-mail
4 - Não, corrigir telefone
          `.trim();
          
          return {
            mensagem: resumo,
            aguardarResposta: true
          };
        }
        
        switch(mensagem) {
          case '1':
            return {
              mensagem: null,
              proximoStep: 'finalizarCadastro',
              aguardarResposta: false
            };
          case '2':
            delete dados.nome;
            return {
              mensagem: null,
              proximoStep: 'coletarNome',
              aguardarResposta: false
            };
          case '3':
            delete dados.email;
            return {
              mensagem: null,
              proximoStep: 'coletarEmail',
              aguardarResposta: false
            };
          case '4':
            delete dados.telefone;
            return {
              mensagem: null,
              proximoStep: 'coletarTelefone',
              aguardarResposta: false
            };
          default:
            return {
              mensagem: 'Opção inválida. Digite 1, 2, 3 ou 4:',
              aguardarResposta: true
            };
        }
      }
    },
    
    finalizarCadastro: {
      acao: async (dados) => {
        // Simula salvamento no banco
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          mensagem: `🎉 Cadastro realizado com sucesso!\n\nSeja bem-vindo(a), ${dados.nome.split(' ')[0]}!`,
          finalizar: true
        };
      }
    }
  }
};

// ============================================
// EXEMPLO 4: Fluxo de Agendamento com Etapas
// ============================================

const fluxoAgendamento = {
  nome: 'agendamento_servico',
  stepInicial: 'escolherServico',
  
  steps: {
    escolherServico: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: '🔧 Agendamento de Serviço\n\nEscolha o serviço:\n1 - Manutenção\n2 - Instalação\n3 - Consultoria',
            aguardarResposta: true
          };
        }
        
        const servicos = {
          '1': { nome: 'Manutenção', duracao: 120 },
          '2': { nome: 'Instalação', duracao: 180 },
          '3': { nome: 'Consultoria', duracao: 60 }
        };
        
        const servico = servicos[mensagem];
        
        if (!servico) {
          return {
            mensagem: 'Opção inválida. Digite 1, 2 ou 3:',
            aguardarResposta: true
          };
        }
        
        dados.servico = servico;
        
        return {
          mensagem: null,
          proximoStep: 'escolherData',
          aguardarResposta: false
        };
      }
    },
    
    escolherData: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          return {
            mensagem: `Serviço selecionado: ${dados.servico.nome}\nDuração estimada: ${dados.servico.duracao} minutos\n\nEscolha a data:\n1 - Hoje\n2 - Amanhã\n3 - Depois de amanhã`,
            aguardarResposta: true
          };
        }
        
        const datas = {
          '1': 'Hoje (27/01/2026)',
          '2': 'Amanhã (28/01/2026)',
          '3': 'Depois de amanhã (29/01/2026)'
        };
        
        const data = datas[mensagem];
        
        if (!data) {
          return {
            mensagem: 'Opção inválida. Digite 1, 2 ou 3:',
            aguardarResposta: true
          };
        }
        
        dados.data = data;
        
        return {
          mensagem: null,
          proximoStep: 'verificandoDisponibilidade',
          aguardarResposta: false
        };
      }
    },
    
    verificandoDisponibilidade: {
      acao: async (dados) => {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Simula horários disponíveis
        dados.horariosDisponiveis = ['09:00', '11:00', '14:00', '16:00'];
        
        return {
          mensagem: '🔍 Verificando disponibilidade...',
          proximoStep: 'escolherHorario',
          aguardarResposta: false
        };
      }
    },
    
    escolherHorario: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          const opcoes = dados.horariosDisponiveis
            .map((h, i) => `${i+1} - ${h}`)
            .join('\n');
          
          return {
            mensagem: `✅ Horários disponíveis para ${dados.data}:\n\n${opcoes}`,
            aguardarResposta: true
          };
        }
        
        const indice = parseInt(mensagem) - 1;
        const horario = dados.horariosDisponiveis[indice];
        
        if (!horario) {
          return {
            mensagem: 'Opção inválida. Escolha um dos horários listados:',
            aguardarResposta: true
          };
        }
        
        dados.horario = horario;
        
        return {
          mensagem: null,
          proximoStep: 'confirmarAgendamento',
          aguardarResposta: false
        };
      }
    },
    
    confirmarAgendamento: {
      acao: async (dados, mensagem) => {
        if (!mensagem) {
          const resumo = `
📅 Resumo do Agendamento:

Serviço: ${dados.servico.nome}
Data: ${dados.data}
Horário: ${dados.horario}
Duração: ${dados.servico.duracao} minutos

Confirmar agendamento?
1 - Sim
2 - Não
          `.trim();
          
          return {
            mensagem: resumo,
            aguardarResposta: true
          };
        }
        
        if (mensagem === '1') {
          return {
            mensagem: null,
            proximoStep: 'processandoAgendamento',
            aguardarResposta: false
          };
        } else if (mensagem === '2') {
          return {
            mensagem: 'Agendamento cancelado. Deseja iniciar novamente?\n1 - Sim\n2 - Não',
            aguardarResposta: true,
            // Poderia voltar ao início ou finalizar
          };
        }
        
        return {
          mensagem: 'Opção inválida. Digite 1 para confirmar ou 2 para cancelar:',
          aguardarResposta: true
        };
      }
    },
    
    processandoAgendamento: {
      acao: async (dados) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Gera código de confirmação
        dados.codigoConfirmacao = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        return {
          mensagem: '⏳ Processando seu agendamento...',
          proximoStep: 'agendamentoConcluido',
          aguardarResposta: false
        };
      }
    },
    
    agendamentoConcluido: {
      acao: async (dados) => {
        const mensagem = `
✅ Agendamento Confirmado!

Código: ${dados.codigoConfirmacao}
Serviço: ${dados.servico.nome}
Data: ${dados.data}
Horário: ${dados.horario}

Você receberá uma confirmação por e-mail.
Até breve! 👋
        `.trim();
        
        return {
          mensagem,
          finalizar: true
        };
      }
    }
  }
};

// ============================================
// EXPORTAR TODOS OS FLUXOS
// ============================================

module.exports = {
  fluxoPesquisaSatisfacao,
  fluxoRastreamento,
  fluxoCadastroCompleto,
  fluxoAgendamento
};
