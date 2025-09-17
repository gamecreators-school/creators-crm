# 🏢 Sistema CRM Completo - Google Apps Script

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285f4?style=for-the-badge&logo=google&logoColor=white)](https://script.google.com)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34a853?style=for-the-badge&logo=google-sheets&logoColor=white)](https://sheets.google.com)
[![HTML5](https://img.shields.io/badge/HTML5-e34f26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572b6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)

> Um sistema CRM profissional e completo desenvolvido inteiramente com Google Apps Script e Google Sheets. Ideal para pequenas e médias empresas que precisam de uma solução robusta e gratuita para gerenciar leads e vendas.

## ✨ Funcionalidades

### 🔐 **Sistema de Autenticação**
- Login automático via conta Google
- Controle de acesso por função (Admin, Gerente, Assistente)
- Permissões granulares por unidade

### 📊 **Dashboard Interativo**
- Métricas em tempo real
- Gráficos de conversão
- Agenda de compromissos
- Ações rápidas

### 📋 **Kanban de Leads**
- Interface visual drag & drop
- Status personalizáveis
- Filtros avançados
- Atualização em tempo real

### 📈 **Relatórios Avançados**
- Funil de conversão
- Performance por usuário
- Análise temporal
- Filtros por período/unidade

### 👥 **Gerenciamento de Usuários**
- Criação e edição de usuários
- Controle de permissões
- Ativação/desativação
- Logs de auditoria

### 📥 **Importação em Massa**
- Upload de CSV/Excel
- Mapeamento inteligente de colunas
- Validação automática
- Relatório de erros

## 🚀 Instalação Rápida

### Pré-requisitos
- Conta Google
- Acesso ao Google Apps Script
- Planilha Google Sheets

### Passo a Passo

1. **Clone ou baixe este repositório**
```bash
git clone https://github.com/seu-usuario/sistema-crm-google-sheets.git
```

2. **Acesse [Google Apps Script](https://script.google.com)**

3. **Crie um novo projeto**
   - Clique em "Novo projeto"
   - Renomeie para "Sistema CRM"

4. **Adicione os arquivos**
   - Cole o conteúdo de `Code.gs` no arquivo principal
   - Crie cada arquivo HTML: `Arquivo > Novo > Arquivo HTML`
   - Cole o conteúdo correspondente de cada arquivo da pasta `html/`

5. **Execute a configuração inicial**
```javascript
// No editor do Apps Script, execute:
setupSystem()
```

6. **Acesse o sistema**
```javascript
// Execute para abrir:
openCRMSystem()
```

## 📱 Como Usar

### Primeiro Acesso (Administrador)
1. Execute `setupSystem()` - cria as tabelas e usuário admin
2. Execute `openCRMSystem()` - abre a interface de login
3. Seu email será automaticamente registrado como admin

### Fluxo de Trabalho
1. **Admin**: Configura usuários e unidades
2. **Gerente**: Distribui leads e monitora performance
3. **Assistente**: Trabalha os leads atribuídos
4. **Sistema**: Gera relatórios e métricas automaticamente

## 🎯 Screenshots

### Dashboard Principal
![Dashboard](screenshots/dashboard.png)

### Kanban de Leads
![Kanban](screenshots/kanban.png)

### Relatórios
![Relatórios](screenshots/reports.png)

## ⚙️ Configuração

### Estrutura de Permissões

| Função | Acesso | Leads | Relatórios | Usuários |
|--------|--------|-------|------------|----------|
| **Admin** | Todas unidades | Todos | Completos | Gerenciar |
| **Gerente** | Sua unidade | Da unidade | Da unidade | - |
| **Assistente** | Sua unidade | Atribuídos | Próprios | - |

### Personalização

#### Adicionar Nova Unidade
```javascript
function getUnidades() {
  return [
    'Unidade Centro',
    'Unidade Zona Sul', 
    'Sua Nova Unidade' // Adicione aqui
  ];
}
```

#### Customizar Status
```javascript
function getStatusOptions() {
  return [
    'Novo',
    'Em contato', 
    'Agendado',
    'Seu Status Personalizado' // Adicione aqui
  ];
}
```

## 🔧 API Reference

### Principais Funções

#### Gerenciamento de Leads
```javascript
// Criar novo lead
createLead(leadData)

// Buscar leads com filtros
getLeads(filters)

// Atualizar status
updateLeadStatus(leadId, newStatus, observacoes)
```

#### Gerenciamento de Usuários
```javascript
// Criar usuário
createUser(userData)

// Buscar usuário por email
getUserByEmail(email)

// Verificar permissões
hasPermission(userFunction, permission)
```

#### Relatórios
```javascript
// Gerar relatório
generateReportData(filters)

// Exportar dados
exportReportToPDF(reportData)
```

## 🛡️ Segurança

### Controles Implementados
- ✅ Autenticação obrigatória via Google
- ✅ Validação de permissões em cada operação
- ✅ Logs completos de auditoria
- ✅ Isolamento de dados por unidade
- ✅ Backup automático semanal

### Logs de Auditoria
Todas as ações são registradas com:
- Data/hora da ação
- Usuário responsável
- Tipo de operação
- Detalhes da alteração

## 📊 Dados e Backup

### Estrutura das Abas
- **Usuários**: Controle de acesso
- **Leads**: Dados principais
- **Agendamentos**: Compromissos
- **Relatórios**: Histórico de relatórios
- **Logs**: Auditoria completa

### Backup Automático
- Execução: Domingos às 2h
- Formato: Cópia completa da planilha
- Local: Pasta "CRM_Backups" no Google Drive

## 🚨 Troubleshooting

### Problemas Comuns

**❌ "Usuário não encontrado"**
```javascript
// Solução: Execute novamente a configuração
setupSystem()
```

**❌ Interface não carrega**
- Verifique se todos os arquivos HTML foram criados
- Confirme os nomes exatos dos arquivos

**❌ Dados não aparecem**
```javascript
// Teste a conexão
testSystem()
```

### Funções de Debug
```javascript
testSystem()        // Testar funcionamento
clearAllData()      // Limpar dados (CUIDADO!)
setupTriggers()     // Configurar automações
createBackup()      // Backup manual
```

## 🤝 Contribuindo

1. **Fork** este repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

### Diretrizes
- Mantenha o código comentado
- Teste todas as funcionalidades
- Atualize a documentação
- Siga os padrões de nomenclatura existentes

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-linkedin](https://linkedin.com/in/seu-linkedin)
- Email: seu.email@exemplo.com

## 🙏 Agradecimentos

- Google Apps Script pela plataforma robusta
- Comunidade open source pelas inspirações
- Usuários que testaram e deram feedback

## 📈 Roadmap

### Versão 2.0 (Planejado)
- [ ] Integração com WhatsApp Business
- [ ] Gráficos interativos com Chart.js
- [ ] Exportação real para PDF/Excel
- [ ] Notificações push
- [ ] App mobile (PWA)
- [ ] Integração com Google Calendar
- [ ] API REST para integrações externas

### Versão 1.1 (Em desenvolvimento)
- [ ] Suporte completo ao Excel (xlsx)
- [ ] Templates de email
- [ ] Campos personalizáveis
- [ ] Dashboard executivo
- [ ] Métricas avançadas

## ⭐ Estrelas

Se este projeto te ajudou, considere dar uma ⭐ no GitHub!

---

<div align="center">

**Desenvolvido com ❤️ usando Google Apps Script**

[⬆️ Voltar ao topo](#-sistema-crm-completo---google-apps-script)

</div>
