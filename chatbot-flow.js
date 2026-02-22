class FluxoEngine {
  constructor() {
    this.sessoes = new Map(); // Armazena sessões de usuários
    this.fluxos = new Map(); // Armazena fluxos disponíveis
  }

  registrarFluxo(nomeFluxo, configFluxo) {
    this.fluxos.set(nomeFluxo, configFluxo);
  }

  iniciarFluxo(usuarioId, nomeFluxo, contract) {
    const fluxo = this.fluxos.get(nomeFluxo);
    if (!fluxo) {
      throw new Error(`Fluxo ${nomeFluxo} não encontrado`);
    }

    this.sessoes.set(usuarioId, {
      fluxoAtual: nomeFluxo,
      stepAtual: fluxo.stepInicial,
      dados: {contract, usuarioId},
      historico: []
    });

    return this.executarStep(usuarioId);
  }

  async processarMensagem(usuarioId, mensagem) {
    const sessao = this.sessoes.get(usuarioId);
    
    if (!sessao) {
      return {
        mensagens: ['Sessão não encontrada. Inicie um novo atendimento.'],
        finalizado: true
      };
    }

    // Armazena a mensagem do usuário
    sessao.dados.ultimaMensagem = mensagem;
    sessao.historico.push({ tipo: 'usuario', mensagem });

    // Executa o step atual com a mensagem do usuário
    return await this.executarStep(usuarioId, mensagem);
  }

  async executarStep(usuarioId, mensagemUsuario = null, _mensagensAcumuladas = []) {
    const sessao = this.sessoes.get(usuarioId);
    const fluxo = this.fluxos.get(sessao.fluxoAtual);
    const step = fluxo.steps[sessao.stepAtual];

    if (!step) {
      return {
        mensagens: [..._mensagensAcumuladas, 'Erro: Step não encontrado'],
        finalizado: true
      };
    }

    // Executa a ação do step
    const resultado = await step.acao(sessao.dados, mensagemUsuario);

    // Acumula a mensagem deste step (se houver)
    if (resultado.mensagem) {
      sessao.historico.push({ tipo: 'bot', mensagem: resultado.mensagem });
      _mensagensAcumuladas.push({
        tipo: resultado.tipo || null,
        content: resultado.mensagem
      });
    }

    // Verifica se deve finalizar
    if (resultado.finalizar) {
      this.sessoes.delete(usuarioId);
      return {
        mensagens: _mensagensAcumuladas,
        finalizado: true,
        abrirChamado: resultado.abrirChamado || false
      };
    }

    // Define o próximo step
    if (resultado.proximoStep) {
      sessao.stepAtual = resultado.proximoStep;
    }

    // Se não aguarda resposta, continua executando e acumulando mensagens
    if (!resultado.aguardarResposta && resultado.proximoStep) {
      return await this.executarStep(usuarioId, null, _mensagensAcumuladas);
    }

    return {
      mensagens: _mensagensAcumuladas,
      finalizado: false,
      aguardandoResposta: resultado.aguardarResposta
    };
  }

  obterSessao(usuarioId) {
    return this.sessoes.get(usuarioId);
  }
}

// Exporta para uso externo
module.exports = {
  FluxoEngine
};
