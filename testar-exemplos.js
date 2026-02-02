// TESTE DOS FLUXOS DE EXEMPLO

const { FluxoEngine } = require('./chatbot-flow');
const {
  fluxoPesquisaSatisfacao,
  fluxoRastreamento,
  fluxoCadastroCompleto,
  fluxoAgendamento
} = require('./exemplos-fluxos');

async function testarFluxoPesquisa() {
  console.log('\n' + '='.repeat(70));
  console.log('TESTE: FLUXO DE PESQUISA DE SATISFAÇÃO');
  console.log('='.repeat(70) + '\n');

  const engine = new FluxoEngine();
  engine.registrarFluxo('pesquisa_satisfacao', fluxoPesquisaSatisfacao);

  const usuarioId = 'user_pesquisa';
  
  // Inicia o fluxo
  let resposta = await engine.iniciarFluxo(usuarioId, 'pesquisa_satisfacao');
  console.log(`🤖 BOT: ${resposta.mensagem}\n`);

  // Simula respostas do usuário
  const mensagens = ['5', 'O atendimento foi lento'];

  for (const msg of mensagens) {
    console.log(`👤 USUÁRIO: ${msg}\n`);
    resposta = await engine.processarMensagem(usuarioId, msg);
    
    if (resposta.mensagem) {
      console.log(`🤖 BOT: ${resposta.mensagem}\n`);
    }
    
    if (resposta.finalizado) break;
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

async function testarFluxoRastreamento() {
  console.log('\n' + '='.repeat(70));
  console.log('TESTE: FLUXO DE RASTREAMENTO DE PEDIDO');
  console.log('='.repeat(70) + '\n');

  const engine = new FluxoEngine();
  engine.registrarFluxo('rastreamento_pedido', fluxoRastreamento);

  const usuarioId = 'user_rastreamento';
  
  let resposta = await engine.iniciarFluxo(usuarioId, 'rastreamento_pedido');
  console.log(`🤖 BOT: ${resposta.mensagem}\n`);

  const mensagens = ['123456', '2'];

  for (const msg of mensagens) {
    console.log(`👤 USUÁRIO: ${msg}\n`);
    resposta = await engine.processarMensagem(usuarioId, msg);
    
    if (resposta.mensagem) {
      console.log(`🤖 BOT: ${resposta.mensagem}\n`);
    }
    
    if (resposta.finalizado) break;
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

async function testarFluxoCadastro() {
  console.log('\n' + '='.repeat(70));
  console.log('TESTE: FLUXO DE CADASTRO COMPLETO');
  console.log('='.repeat(70) + '\n');

  const engine = new FluxoEngine();
  engine.registrarFluxo('cadastro_completo', fluxoCadastroCompleto);

  const usuarioId = 'user_cadastro';
  
  let resposta = await engine.iniciarFluxo(usuarioId, 'cadastro_completo');
  console.log(`🤖 BOT: ${resposta.mensagem}\n`);

  const mensagens = [
    'João da Silva Santos',
    'joao.silva@email.com',
    '11987654321',
    '1' // Confirma dados
  ];

  for (const msg of mensagens) {
    console.log(`👤 USUÁRIO: ${msg}\n`);
    resposta = await engine.processarMensagem(usuarioId, msg);
    
    if (resposta.mensagem) {
      console.log(`🤖 BOT: ${resposta.mensagem}\n`);
    }
    
    if (resposta.finalizado) break;
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

async function testarFluxoAgendamento() {
  console.log('\n' + '='.repeat(70));
  console.log('TESTE: FLUXO DE AGENDAMENTO');
  console.log('='.repeat(70) + '\n');

  const engine = new FluxoEngine();
  engine.registrarFluxo('agendamento_servico', fluxoAgendamento);

  const usuarioId = 'user_agendamento';
  
  let resposta = await engine.iniciarFluxo(usuarioId, 'agendamento_servico');
  console.log(`🤖 BOT: ${resposta.mensagem}\n`);

  const mensagens = [
    '1',  // Manutenção
    '2',  // Amanhã
    '2',  // 11:00
    '1'   // Confirma
  ];

  for (const msg of mensagens) {
    console.log(`👤 USUÁRIO: ${msg}\n`);
    resposta = await engine.processarMensagem(usuarioId, msg);
    
    if (resposta.mensagem) {
      console.log(`🤖 BOT: ${resposta.mensagem}\n`);
    }
    
    if (resposta.finalizado) break;
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

async function executarTodosTestes() {
  console.log('\n🚀 INICIANDO TESTES DE TODOS OS FLUXOS\n');
  
  await testarFluxoPesquisa();
  await testarFluxoRastreamento();
  await testarFluxoCadastro();
  await testarFluxoAgendamento();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ TODOS OS TESTES CONCLUÍDOS!');
  console.log('='.repeat(70) + '\n');
}

// Permite escolher qual teste executar
const arg = process.argv[2];

switch(arg) {
  case 'pesquisa':
    testarFluxoPesquisa().catch(console.error);
    break;
  case 'rastreamento':
    testarFluxoRastreamento().catch(console.error);
    break;
  case 'cadastro':
    testarFluxoCadastro().catch(console.error);
    break;
  case 'agendamento':
    testarFluxoAgendamento().catch(console.error);
    break;
  default:
    executarTodosTestes().catch(console.error);
}
