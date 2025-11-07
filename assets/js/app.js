// Dados iniciais
let users = JSON.parse(localStorage.getItem('forumUsers')) || [];
let complaints = JSON.parse(localStorage.getItem('forumComplaints')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Configuração inicial
window.onload = function() {
    setupForms();
    loadHomeComplaints();
    checkLogin();
};

// Configurar formulários
function setupForms() {
    // Cadastro de usuário
    document.getElementById('register-user-form').onsubmit = function(e) {
        e.preventDefault();
        registerUser();
    };

    // Login de usuário
    document.getElementById('login-user-form').onsubmit = function(e) {
        e.preventDefault();
        loginUser();
    };

    // Login da prefeitura
    document.getElementById('login-prefeitura-form').onsubmit = function(e) {
        e.preventDefault();
        loginPrefeitura();
    };

    // Nova reclamação
    document.getElementById('new-complaint-form').onsubmit = function(e) {
        e.preventDefault();
        submitComplaint();
    };
}

// Cadastrar usuário
function registerUser() {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const address = document.getElementById('user-address').value;

    if (users.find(user => user.email === email)) {
        alert('E-mail já cadastrado!');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        address,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('forumUsers', JSON.stringify(users));
    
    alert('Cadastro realizado com sucesso!');
    showPage('login-user');
}

// Login usuário
function loginUser() {
    const email = document.getElementById('login-user-email').value;
    const password = document.getElementById('login-user-password').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showUserDashboard();
    } else {
        alert('E-mail ou senha incorretos!');
    }
}

// Login prefeitura
function loginPrefeitura() {
    const email = document.getElementById('login-pref-email').value;
    const password = document.getElementById('login-pref-password').value;

    // Credenciais fixas da prefeitura
    if (email === 'prefeitura@cidade.gov.br' && password === 'admin123') {
        currentUser = { name: 'Prefeitura Municipal', isPrefeitura: true };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showPrefeituraDashboard();
    } else {
        alert('Credenciais da prefeitura incorretas!');
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showPage('home');
}

// Verificar se está logado
function checkLogin() {
    if (currentUser) {
        if (currentUser.isPrefeitura) {
            showPrefeituraDashboard();
        } else {
            showUserDashboard();
        }
    }
}

// Enviar reclamação
function submitComplaint() {
    if (!currentUser || currentUser.isPrefeitura) {
        alert('Você precisa estar logado como cidadão!');
        return;
    }

    const title = document.getElementById('complaint-title').value;
    const category = document.getElementById('complaint-category').value;
    const description = document.getElementById('complaint-description').value;
    const location = document.getElementById('complaint-location').value;

    const newComplaint = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        title,
        category,
        description,
        location,
        status: 'pendente',
        createdAt: new Date().toISOString(),
        responses: []
    };

    complaints.unshift(newComplaint);
    localStorage.setItem('forumComplaints', JSON.stringify(complaints));
    
    document.getElementById('new-complaint-form').reset();
    hideComplaintForm();
    showUserDashboard();
    
    alert('Reclamação enviada com sucesso!');
}

// Adicionar resposta
function addResponse(complaintId) {
    const responseText = document.getElementById(`response-${complaintId}`).value;
    
    if (!responseText.trim()) {
        alert('Digite uma resposta!');
        return;
    }

    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        const response = {
            id: Date.now().toString(),
            text: responseText,
            author: 'Prefeitura Municipal',
            createdAt: new Date().toISOString()
        };
        
        complaint.responses.push(response);
        complaint.status = 'respondida';
        localStorage.setItem('forumComplaints', JSON.stringify(complaints));
        
        document.getElementById(`response-${complaintId}`).value = '';
        showPrefeituraDashboard();
        alert('Resposta enviada!');
    }
}

// Mostrar dashboard do usuário
function showUserDashboard() {
    document.getElementById('user-welcome').textContent = currentUser.name;
    loadUserComplaints();
    showPage('dashboard-user');
}

// Carregar reclamações do usuário
function loadUserComplaints() {
    const userComplaints = complaints.filter(c => c.userId === currentUser.id);
    const container = document.getElementById('user-complaints-list');
    
    if (userComplaints.length === 0) {
        container.innerHTML = '<p>Você ainda não fez nenhuma reclamação.</p>';
        return;
    }

    container.innerHTML = userComplaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <div>
                    <div class="complaint-title">${complaint.title}</div>
                    <span class="complaint-category">${getCategoryName(complaint.category)}</span>
                </div>
                <span class="status ${complaint.status}">${complaint.status}</span>
            </div>
            <div class="complaint-description">${complaint.description}</div>
            <div class="complaint-meta">
                <span>Local: ${complaint.location}</span>
                <span>${formatDate(complaint.createdAt)}</span>
            </div>
            ${complaint.responses.length > 0 ? `
                <div class="response-section">
                    <h4>Resposta da Prefeitura:</h4>
                    ${complaint.responses.map(response => `
                        <div class="response">
                            <p>${response.text}</p>
                            <small>${response.author} - ${formatDate(response.createdAt)}</small>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="no-response">Aguardando resposta da prefeitura...</p>'}
        </div>
    `).join('');
}

// Mostrar dashboard da prefeitura
function showPrefeituraDashboard() {
    loadPrefeituraStats();
    loadAllComplaints();
    showPage('dashboard-prefeitura');
}

// Carregar estatísticas
function loadPrefeituraStats() {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pendente').length;
    const answered = complaints.filter(c => c.status === 'respondida').length;

    document.getElementById('total-complaints').textContent = total;
    document.getElementById('pending-complaints').textContent = pending;
    document.getElementById('answered-complaints').textContent = answered;
}

// Carregar todas as reclamações
function loadAllComplaints() {
    const container = document.getElementById('all-complaints-list');
    
    if (complaints.length === 0) {
        container.innerHTML = '<p>Nenhuma reclamação encontrada.</p>';
        return;
    }

    container.innerHTML = complaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <div>
                    <div class="complaint-title">${complaint.title}</div>
                    <span class="complaint-category">${getCategoryName(complaint.category)}</span>
                </div>
                <span class="status ${complaint.status}">${complaint.status}</span>
            </div>
            <div class="complaint-description">${complaint.description}</div>
            <div class="complaint-meta">
                <span>Por: ${complaint.userName}</span>
                <span>Local: ${complaint.location}</span>
                <span>${formatDate(complaint.createdAt)}</span>
            </div>
            ${complaint.responses.length > 0 ? `
                <div class="response-section">
                    <h4>Resposta da Prefeitura:</h4>
                    ${complaint.responses.map(response => `
                        <div class="response">
                            <p>${response.text}</p>
                            <small>${response.author} - ${formatDate(response.createdAt)}</small>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="response-form">
                <textarea id="response-${complaint.id}" placeholder="Digite a resposta da prefeitura..." rows="3"></textarea>
                <button class="btn btn-success" onclick="addResponse('${complaint.id}')">Enviar Resposta</button>
            </div>
        </div>
    `).join('');
}

// Carregar reclamações da página inicial
function loadHomeComplaints() {
    const recentComplaints = complaints.slice(0, 6);
    const container = document.getElementById('complaints-list');
    
    if (recentComplaints.length === 0) {
        container.innerHTML = '<p>Nenhuma reclamação pública disponível.</p>';
        return;
    }

    container.innerHTML = recentComplaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <div class="complaint-title">${complaint.title}</div>
                <span class="complaint-category">${getCategoryName(complaint.category)}</span>
            </div>
            <div class="complaint-description">${complaint.description}</div>
            <div class="complaint-meta">
                <span>Local: ${complaint.location}</span>
                <span>${formatDate(complaint.createdAt)}</span>
            </div>
            ${complaint.responses.length > 0 ? `
                <div class="response-section">
                    <h4>Resposta da Prefeitura:</h4>
                    <p>${complaint.responses[0].text}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Funções auxiliares
function getCategoryName(category) {
    const categories = {
        'infraestrutura': 'Infraestrutura',
        'transporte': 'Transporte',
        'saude': 'Saúde',
        'educacao': 'Educação',
        'seguranca': 'Segurança',
        'meio-ambiente': 'Meio Ambiente',
        'outros': 'Outros'
    };
    return categories[category] || category;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

// Navegação
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showComplaintForm() {
    document.getElementById('complaint-form').style.display = 'block';
}

function hideComplaintForm() {
    document.getElementById('complaint-form').style.display = 'none';
}