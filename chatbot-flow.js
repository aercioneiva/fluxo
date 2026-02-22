const db = require('./connection.js');
const { v4: uuidv4 } = require('uuid');

class FluxoEngine {
  constructor() {
    this.sessoes = new Map(); // Armazena sessões de usuários
    this.fluxos = new Map(); // Armazena fluxos disponíveis
  }

  registrarFluxo(nomeFluxo, configFluxo) {
    this.fluxos.set(nomeFluxo, configFluxo);
  }

  async iniciarFluxo(usuarioId, nomeFluxo, contract) {
    const fluxo = this.fluxos.get(nomeFluxo);
    if (!fluxo) {
      throw new Error(`Fluxo ${nomeFluxo} não encontrado`);
    }

   
    const id = uuidv4();
        await db.insert({
           id: id,
           contract: contract,
           current_flow: nomeFluxo,
           current_step: fluxo.stepInicial,
           data: JSON.stringify({contract, usuarioId}),
           history: JSON.stringify([]),
         })
         .into('user_flow');

         console.log('Sessão iniciada com ID:', id);

    return this.executarStep(id);
  }

  async processarMensagem(usuarioId, mensagem) {
    let sessao = {};
    const [ rows ] = await db.raw(`SELECT * FROM user_flow WHERE id=?`,[usuarioId]);
    if(rows.length > 0) {
      console.log(rows);
      sessao.fluxoAtual = rows[0].current_flow;
      sessao.stepAtual = rows[0].current_step;
      sessao.dados = JSON.parse(rows[0].data);
      sessao.historico = JSON.parse(rows[0].history);
    }else{
       return {
        mensagens: ['Sessão não encontrada. Inicie um novo atendimento.'],
        finalizado: true
      };
    }
    
    // Armazena a mensagem do usuário
    sessao.dados.ultimaMensagem = mensagem;
    sessao.historico.push({ tipo: 'usuario', mensagem });

    const update = await db('user_flow')
            .where({ id: usuarioId })
            .update({
              data: JSON.stringify(sessao.dados),
              history: JSON.stringify(sessao.historico)
            }); 

    // Executa o step atual com a mensagem do usuário
    return await this.executarStep(usuarioId, mensagem);
  }

  async executarStep(usuarioId, mensagemUsuario = null, _mensagensAcumuladas = []) {
    let sessao = {};
    const [ rows ] = await db.raw(`SELECT * FROM user_flow WHERE id=?`,[usuarioId]);
    if(rows.length > 0) {
      sessao.fluxoAtual = rows[0].current_flow;
      sessao.stepAtual = rows[0].current_step;
      sessao.dados = JSON.parse(rows[0].data);
      sessao.historico = JSON.parse(rows[0].history);
    }else{
        return {
          mensagens: ['Sessão não encontrada. Inicie um novo atendimento.'],
          finalizado: true
        };
    }

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
      //this.sessoes.delete(usuarioId);
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

    const update = await db('user_flow')
            .where({ id: usuarioId })
            .update({
              current_step: sessao.stepAtual,
              data: JSON.stringify(sessao.dados),
              history: JSON.stringify(sessao.historico)
            });
    // Se não aguarda resposta, continua executando e acumulando mensagens
    if (!resultado.aguardarResposta && resultado.proximoStep) {
      return await this.executarStep(usuarioId, null, _mensagensAcumuladas);
    }

    return {
      id: usuarioId,
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
