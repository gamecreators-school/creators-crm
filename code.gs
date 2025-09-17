// ============================================================================
// SISTEMA CRM - GOOGLE APPS SCRIPT
// ============================================================================

// Configurações globais
const CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  SHEETS: {
    USUARIOS: 'Usuários',
    LEADS: 'Leads', 
    AGENDAMENTOS: 'Agendamentos',
    RELATORIOS: 'Relatórios',
    LOGS: 'Logs'
  },
  PERMISSIONS: {
    ADMIN: ['VER_LEADS', 'EDITAR_LEADS', 'ATRIBUIR_LEADS', 'GERAR_RELATORIOS', 'CRIAR_USUARIO', 'IMPORTAR_LEADS', 'VER_TODOS_LEADS'],
    GERENTE: ['VER_LEADS', 'EDITAR_LEADS', 'ATRIBUIR_LEADS', 'GERAR_RELATORIOS'],
    ASSISTENTE: ['VER_LEADS', 'EDITAR_LEADS']
  }
};

// ============================================================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 CRM Sistema')
    .addItem('🚀 Abrir Sistema', 'openCRMSystem')
    .addItem('⚙️ Configurar Sistema', 'setupSystem')
    .addItem('👥 Gerenciar Usuários', 'manageUsers')
    .addSeparator()
    .addItem('📊 Relatórios', 'openReports')
    .addItem('📅 Kanban', 'openKanban')
    .addItem('📥 Importar Leads', 'openImportLeads')
    .addToUi();
}

function setupSystem() {
  try {
    createSystemSheets();
    setupInitialData();
    SpreadsheetApp.getUi().alert('✅ Sistema configurado com sucesso!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Erro na configuração: ' + error.message);
  }
}

function createSystemSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Criar aba Usuários
  createOrUpdateSheet(ss, CONFIG.SHEETS.USUARIOS, [
    ['ID', 'Nome Completo', 'Email', 'Função', 'Unidade', 'Status', 'Data Criação', 'Último Acesso']
  ]);
  
  // Criar aba Leads  
  createOrUpdateSheet(ss, CONFIG.SHEETS.LEADS, [
    ['ID', 'Nome', 'Telefone', 'Email', 'Curso', 'Data Cadastro', 'Unidade', 'Responsável', 'Status', 'Observações', 'Origem', 'Data Última Ação']
  ]);
  
  // Criar aba Agendamentos
  createOrUpdateSheet(ss, CONFIG.SHEETS.AGENDAMENTOS, [
    ['ID', 'Lead ID', 'Data', 'Hora', 'Unidade', 'Responsável', 'Status', 'Observações', 'Data Criação']
  ]);
  
  // Criar aba Relatórios (será populada dinamicamente)
  createOrUpdateSheet(ss, CONFIG.SHEETS.RELATORIOS, [
    ['Tipo Relatório', 'Período', 'Filtros', 'Dados', 'Gerado Por', 'Data Geração']
  ]);
  
  // Criar aba Logs
  createOrUpdateSheet(ss, CONFIG.SHEETS.LOGS, [
    ['Timestamp', 'Usuário', 'Ação', 'Detalhes', 'IP', 'User Agent']
  ]);
}

function createOrUpdateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
    
    // Formatação do cabeçalho
    const headerRange = sheet.getRange(1, 1, 1, headers[0].length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    
    // Congelar primeira linha
    sheet.setFrozenRows(1);
    
    // Auto-ajustar colunas
    sheet.autoResizeColumns(1, headers[0].length);
  }
  
  return sheet;
}

function setupInitialData() {
  const userEmail = Session.getActiveUser().getEmail();
  
  // Criar usuário admin inicial
  if (!getUserByEmail(userEmail)) {
    createUser({
      nome: 'Administrador Sistema',
      email: userEmail,
      funcao: 'ADMIN',
      unidade: 'Todas',
      status: 'Ativo'
    });
  }
}

// ============================================================================
// SISTEMA DE AUTENTICAÇÃO
// ============================================================================

function openCRMSystem() {
  const user = getCurrentUser();
  
  if (!user) {
    openLogin();
  } else {
    logUserAction(user.email, 'LOGIN', 'Acesso ao sistema');
    openDashboard(user);
  }
}

function getCurrentUser() {
  const userEmail = Session.getActiveUser().getEmail();
  return getUserByEmail(userEmail);
}

function getUserByEmail(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.USUARIOS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === email && data[i][5] === 'Ativo') { // Email está na coluna 2, Status na 5
      return {
        id: data[i][0],
        nome: data[i][1],
        email: data[i][2],
        funcao: data[i][3],
        unidade: data[i][4],
        status: data[i][5]
      };
    }
  }
  
  return null;
}

function createUser(userData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.USUARIOS);
  const lastRow = sheet.getLastRow();
  const newId = 'USR' + String(lastRow).padStart(4, '0');
  
  const newUser = [
    newId,
    userData.nome,
    userData.email,
    userData.funcao,
    userData.unidade,
    userData.status || 'Ativo',
    new Date(),
    ''
  ];
  
  sheet.appendRow(newUser);
  return newId;
}

function hasPermission(userFunction, permission) {
  const permissions = CONFIG.PERMISSIONS[userFunction] || [];
  return permissions.includes(permission);
}

// ============================================================================
// GESTÃO DE LEADS
// ============================================================================

function getLeads(filters = {}) {
  const user = getCurrentUser();
  if (!user) return [];
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.LEADS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let leads = [];
  
  for (let i = 1; i < data.length; i++) {
    const lead = {};
    headers.forEach((header, index) => {
      lead[header] = data[i][index];
    });
    
    // Aplicar filtros de permissão
    if (canUserViewLead(user, lead)) {
      leads.push(lead);
    }
  }
  
  // Aplicar filtros adicionais
  if (filters.status) {
    leads = leads.filter(lead => lead.Status === filters.status);
  }
  
  if (filters.unidade && user.funcao !== 'ADMIN') {
    leads = leads.filter(lead => lead.Unidade === filters.unidade);
  }
  
  if (filters.responsavel) {
    leads = leads.filter(lead => lead.Responsável === filters.responsavel);
  }
  
  return leads;
}

function canUserViewLead(user, lead) {
  switch (user.funcao) {
    case 'ADMIN':
      return true;
    case 'GERENTE':
      return lead.Unidade === user.unidade;
    case 'ASSISTENTE':
      return lead.Unidade === user.unidade && lead.Responsável === user.nome;
    default:
      return false;
  }
}

function createLead(leadData) {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.funcao, 'EDITAR_LEADS')) {
    throw new Error('Sem permissão para criar leads');
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.LEADS);
  const lastRow = sheet.getLastRow();
  const newId = 'LED' + String(lastRow).padStart(6, '0');
  
  const newLead = [
    newId,
    leadData.nome,
    leadData.telefone,
    leadData.email || '',
    leadData.curso || '',
    new Date(),
    leadData.unidade,
    leadData.responsavel || '',
    'Novo',
    leadData.observacoes || '',
    leadData.origem || 'Manual',
    new Date()
  ];
  
  sheet.appendRow(newLead);
  
  logUserAction(user.email, 'CREATE_LEAD', `Lead criado: ${leadData.nome}`);
  
  return newId;
}

function updateLeadStatus(leadId, newStatus, observacoes = '') {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.funcao, 'EDITAR_LEADS')) {
    throw new Error('Sem permissão para editar leads');
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.LEADS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === leadId) {
      // Verificar se o usuário pode editar este lead
      const lead = {
        Unidade: data[i][6],
        Responsável: data[i][7]
      };
      
      if (!canUserViewLead(user, lead)) {
        throw new Error('Sem permissão para editar este lead');
      }
      
      // Atualizar status
      sheet.getRange(i + 1, 9).setValue(newStatus); // Coluna Status
      sheet.getRange(i + 1, 12).setValue(new Date()); // Data Última Ação
      
      if (observacoes) {
        const currentObs = data[i][9] || '';
        const newObs = currentObs + '\n' + new Date().toLocaleString() + ' - ' + observacoes;
        sheet.getRange(i + 1, 10).setValue(newObs); // Observações
      }
      
      logUserAction(user.email, 'UPDATE_LEAD_STATUS', `Lead ${leadId}: ${newStatus}`);
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// SISTEMA DE AGENDAMENTOS
// ============================================================================

function createAgendamento(agendamentoData) {
  const user = getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.AGENDAMENTOS);
  const lastRow = sheet.getLastRow();
  const newId = 'AGD' + String(lastRow).padStart(6, '0');
  
  const novoAgendamento = [
    newId,
    agendamentoData.leadId,
    agendamentoData.data,
    agendamentoData.hora,
    agendamentoData.unidade,
    agendamentoData.responsavel,
    'Agendado',
    agendamentoData.observacoes || '',
    new Date()
  ];
  
  sheet.appendRow(novoAgendamento);
  
  // Atualizar status do lead
  updateLeadStatus(agendamentoData.leadId, 'Agendado', 'Agendamento criado para ' + agendamentoData.data);
  
  logUserAction(user.email, 'CREATE_AGENDAMENTO', `Agendamento criado para lead ${agendamentoData.leadId}`);
  
  return newId;
}

function getAgendamentos(filtros = {}) {
  const user = getCurrentUser();
  if (!user) return [];
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.AGENDAMENTOS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let agendamentos = [];
  
  for (let i = 1; i < data.length; i++) {
    const agendamento = {};
    headers.forEach((header, index) => {
      agendamento[header] = data[i][index];
    });
    
    // Filtros de permissão
    if (user.funcao === 'ADMIN' || 
        (user.funcao === 'GERENTE' && agendamento.Unidade === user.unidade) ||
        (user.funcao === 'ASSISTENTE' && agendamento.Responsável === user.nome)) {
      agendamentos.push(agendamento);
    }
  }
  
  return agendamentos;
}

// ============================================================================
// SISTEMA DE LOGS
// ============================================================================

function logUserAction(userEmail, action, details) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.LOGS);
    const logEntry = [
      new Date(),
      userEmail,
      action,
      details,
      '', // IP - não disponível no Apps Script
      '' // User Agent - não disponível no Apps Script
    ];
    
    sheet.appendRow(logEntry);
  } catch (error) {
    console.log('Erro ao salvar log:', error);
  }
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

function getUnidades() {
  return ['Unidade Centro', 'Unidade Zona Sul', 'Unidade Zona Norte', 'Unidade Zona Leste', 'Unidade Zona Oeste'];
}

function getResponsaveis() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.USUARIOS);
  const data = sheet.getDataRange().getValues();
  const responsaveis = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][5] === 'Ativo') { // Status ativo
      responsaveis.push(data[i][1]); // Nome
    }
  }
  
  return responsaveis;
}

function getStatusOptions() {
  return ['Novo', 'Em contato', 'Agendado', 'Compareceu', 'Matrícula', 'Não Compareceu', 'Reagendado', 'Perdido'];
}

// ============================================================================
// FUNÇÕES DE INTERFACE
// ============================================================================

function openLogin() {
  const html = HtmlService.createTemplateFromFile('login');
  const htmlOutput = html.evaluate()
    .setWidth(400)
    .setHeight(300)
    .setTitle('🔐 Login - Sistema CRM');
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Sistema CRM - Login');
}

function openDashboard(user) {
  const html = HtmlService.createTemplateFromFile('dashboard');
  html.user = user;
  html.leads = getLeads();
  html.agendamentos = getAgendamentos();
  
  const htmlOutput = html.evaluate()
    .setWidth(1200)
    .setHeight(800)
    .setTitle('📊 Dashboard - Sistema CRM');
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Sistema CRM - Dashboard');
}

function openKanban() {
  const user = getCurrentUser();
  if (!user) {
    openLogin();
    return;
  }
  
  const html = HtmlService.createTemplateFromFile('kanban');
  html.user = user;
  html.leads = getLeads();
  
  const htmlOutput = html.evaluate()
    .setWidth(1400)
    .setHeight(800)
    .setTitle('📋 Kanban - Sistema CRM');
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Kanban de Leads');
}

function openReports() {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.funcao, 'GERAR_RELATORIOS')) {
    SpreadsheetApp.getUi().alert('❌ Sem permissão para acessar relatórios');
    return;
  }
  
  const html = HtmlService.createTemplateFromFile('reports');
  html.user = user;
  
  const htmlOutput = html.evaluate()
    .setWidth(1200)
    .setHeight(800)
    .setTitle('📊 Relatórios - Sistema CRM');
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Relatórios do Sistema');
}

function openImportLeads() {
  const user = getCurrentUser();
  if (!user || !hasPermission(user.funcao, 'IMPORTAR_LEADS')) {
    SpreadsheetApp.getUi().alert('❌ Sem permissão para importar leads');
    return;
  }
  
  const html = HtmlService.createTemplateFromFile('import-leads');
  html.user = user;
  html.unidades = getUnidades();
  html.responsaveis = getResponsaveis();
  
  const htmlOutput = html.evaluate()
    .setWidth(900)
    .setHeight(700)
    .setTitle('📥 Importar Leads - Sistema CRM');
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Importar Leads');
}

function manageUsers() {
  const user = getCurrentUser();
  if (!user || user.funcao !== 'ADMIN') {
    SpreadsheetApp.getUi().alert('❌ Apenas administradores podem gerenciar usuários');
    return;
  }
  
  const html = HtmlService.createTemplateFromFile('manage-users');
  html.user = user;
  html.usuarios = getAllUsers();
  html.unidades = getUnidades();
  
  const htmlOutput = html.evaluate()
    .setWidth(1000)
    .setHeight(700)
    .setTitle('👥 Gerenciar Usuários - Sistema CRM');
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Gerenciar Usuários');
}

function getAllUsers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.USUARIOS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const users = [];
  
  for (let i = 1; i < data.length; i++) {
    const user = {};
    headers.forEach((header, index) => {
      user[header] = data[i][index];
    });
    users.push(user);
  }
  
  return users;
}

// ============================================================================
// FUNÇÃO PARA INCLUIR ARQUIVOS HTML
// ============================================================================

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
