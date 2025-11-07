// Sistema de Fórum de Reclamações

// Dados iniciais (simulando um banco de dados)
let users = JSON.parse(localStorage.getItem('forum_users')) || [
    {
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
        password: "123456",
        role: "citizen",
        neighborhood: "Centro"
    },
    {
        id: 2,
        name: "Prefeitura Municipal",
        email: "prefeitura@cidade.gov.br",
        password: "admin123",
        role: "prefecture"
    }
];

let complaints = JSON.parse(localStorage.getItem('forum_complaints')) || [
    {
        id: 1,
        title: "Buraco na Rua Principal",
        description: "Existe um buraco grande na Rua Principal, próximo ao número 123, que está causando acidentes.",
        category: "Infraestrutura",
        location: "Rua Principal, 123 - Centro",
        author: "João Silva",
        authorId: 1,
        date: "2024-01-15",
        status: "in-progress",
        responses: [
            {
                id: 1,
                text: "A prefeitura já está ciente do problema e a equipe de manutenção será enviada nesta semana para reparo.",
                author: "Prefeitura Municipal",
                date: "2024-01-16"
            }
        ]
    },
    {
        id: 2,
        title: "Falta de Iluminação Pública",
        description: "Várias lâmpadas estão queimadas na Avenida Central, deixando a área perigosa à noite.",
        category: "Infraestrutura",
        location: "Avenida Central - Jardim das Flores",
        author: "Maria Santos",
        authorId: 3,
        date: "2024-01-10",
        status: "pending",
        responses: []
    }
];

let currentUser = JSON.parse(localStorage.getItem('forum_currentUser')) || null;

// Elementos da página
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const newComplaintPage = document.getElementById('new-complaint-page');
const adminPage = document.getElementById('admin-page');
const complaintsList = document.getElementById('complaints-list');
const adminComplaintsList = document.getElementById('admin-complaints-list');

// Funções de navegação
function showPage(page) {
    loginPage.classList.add('hidden');
    mainPage.classList.add('hidden');
    newComplaintPage.classList.add('hidden');
    adminPage.classList.add('hidden');

    page.classList.remove('hidden');
}

function updateNavigation() {
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');
    const navNewComplaint = document.getElementById('nav-new-complaint');
    const navAdmin = document.getElementById('nav-admin');

    if (currentUser) {
        navLogin.classList.add('hidden');
        navLogout.classList.remove('hidden');

        if (currentUser.role === 'citizen') {
            navNewComplaint.classList.remove('hidden');
            navAdmin.classList.add('hidden');
        } else if (currentUser.role === 'prefecture') {
            navNewComplaint.classList.add('hidden');
            navAdmin.classList.remove('hidden');
        }

        // Atualizar informações do usuário
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-role').textContent =
            currentUser.role === 'citizen' ? 'Cidadão' : 'Prefeitura';
        document.getElementById('user-avatar').textContent =
            currentUser.name.charAt(0).toUpperCase();
    } else {
        navLogin.classList.remove('hidden');
        navLogout.classList.add('hidden');
        navNewComplaint.classList.add('hidden');
        navAdmin.classList.add('hidden');
    }
}

// Sistema de login/registro
document.getElementById('citizen-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('citizen-email').value;
    const password = document.getElementById('citizen-password').value;

    const user = users.find(u => u.email === email && u.password === password && u.role === 'citizen');

    if (user) {
        currentUser = user;
        localStorage.setItem('forum_currentUser', JSON.stringify(currentUser));
        updateNavigation();
        showPage(mainPage);
        loadComplaints();
    } else {
        alert('E-mail ou senha incorretos!');
    }
});

document.getElementById('prefecture-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('prefecture-email').value;
    const password = document.getElementById('prefecture-password').value;

    const user = users.find(u => u.email === email && u.password === password && u.role === 'prefecture');

    if (user) {
        currentUser = user;
        localStorage.setItem('forum_currentUser', JSON.stringify(currentUser));
        updateNavigation();
        showPage(adminPage);
        loadAdminComplaints();
    } else {
        alert('E-mail ou senha incorretos!');
    }
});

document.getElementById('citizen-register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const neighborhood = document.getElementById('register-neighborhood').value;

    // Verificar se o usuário já existe
    if (users.find(u => u.email === email)) {
        alert('Este e-mail já está cadastrado!');
        return;
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        role: 'citizen',
        neighborhood
    };

    users.push(newUser);
    localStorage.setItem('forum_users', JSON.stringify(users));

    alert('Cadastro realizado com sucesso! Faça login para continuar.');
    showLoginForm();
});

// Navegação entre login e registro
document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
});

// Sistema de tabs no login
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(`${this.dataset.tab}-login`).classList.add('active');
    });
});

// Navegação principal
document.getElementById('nav-home').addEventListener('click', function(e) {
    e.preventDefault();
    if (currentUser) {
        if (currentUser.role === 'citizen') {
            showPage(mainPage);
            loadComplaints();
        } else {
            showPage(adminPage);
            loadAdminComplaints();
        }
    } else {
        showPage(loginPage);
    }
});

document.getElementById('nav-complaints').addEventListener('click', function(e) {
    e.preventDefault();
    if (currentUser) {
        showPage(mainPage);
        loadComplaints();
    }
});

document.getElementById('nav-new-complaint').addEventListener('click', function(e) {
    e.preventDefault();
    showPage(newComplaintPage);
});

document.getElementById('nav-admin').addEventListener('click', function(e) {
    e.preventDefault();
    showPage(adminPage);
    loadAdminComplaints();
});

document.getElementById('nav-login').addEventListener('click', function(e) {
    e.preventDefault();
    showPage(loginPage);
});

document.getElementById('nav-logout').addEventListener('click', function(e) {
    e.preventDefault();
    currentUser = null;
    localStorage.removeItem('forum_currentUser');
    updateNavigation();
    showPage(loginPage);
});

// Sistema de reclamações
document.getElementById('new-complaint-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('complaint-title').value;
    const category = document.getElementById('complaint-category').value;
    const location = document.getElementById('complaint-location').value;
    const description = document.getElementById('complaint-description').value;

    const newComplaint = {
        id: complaints.length + 1,
        title,
        description,
        category,
        location,
        author: currentUser.name,
        authorId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        responses: []
    };

    complaints.push(newComplaint);
    localStorage.setItem('forum_complaints', JSON.stringify(complaints));

    alert('Reclamação enviada com sucesso!');
    document.getElementById('new-complaint-form').reset();
    showPage(mainPage);
    loadComplaints();
});

function loadComplaints() {
    complaintsList.innerHTML = '';

    if (complaints.length === 0) {
        complaintsList.innerHTML = '<div class="card">Nenhuma reclamação encontrada.</div>';
        return;
    }

    // Ordenar por data (mais recente primeiro)
    const sortedComplaints = [...complaints].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedComplaints.forEach(complaint => {
        const complaintElement = document.createElement('div');
        complaintElement.className = 'card complaint';
        complaintElement.innerHTML = `
            <div class="complaint-header">
                <div class="complaint-title">${complaint.title}</div>
                <div class="complaint-date">${formatDate(complaint.date)}</div>
            </div>
            <div class="complaint-meta">
                <span class="complaint-author">${complaint.author}</span>
                <span class="complaint-location">${complaint.location}</span>
            </div>
            <div class="complaint-category">${complaint.category}</div>
            <div class="status-badge status-${complaint.status}">
                ${getStatusText(complaint.status)}
            </div>
            <p>${complaint.description}</p>
            ${complaint.responses.map(response => `
                <div class="response card">
                    <div class="complaint-header">
                        <div class="complaint-title">Resposta da Prefeitura</div>
                        <div class="complaint-date">${formatDate(response.date)}</div>
                    </div>
                    <p>${response.text}</p>
                    <div class="complaint-meta">
                        <span class="complaint-author">${response.author}</span>
                    </div>
                </div>
            `).join('')}
        `;

        complaintsList.appendChild(complaintElement);
    });
}

function loadAdminComplaints() {
    adminComplaintsList.innerHTML = '';

    // Atualizar estatísticas
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;

    document.getElementById('total-complaints').textContent = total;
    document.getElementById('pending-complaints').textContent = pending;
    document.getElementById('progress-complaints').textContent = inProgress;
    document.getElementById('resolved-complaints').textContent = resolved;

    if (complaints.length === 0) {
        adminComplaintsList.innerHTML = '<div class="card">Nenhuma reclamação encontrada.</div>';
        return;
    }

    complaints.forEach(complaint => {
        const complaintElement = document.createElement('div');
        complaintElement.className = 'card complaint';
        complaintElement.innerHTML = `
            <div class="complaint-header">
                <div class="complaint-title">${complaint.title}</div>
                <div class="complaint-date">${formatDate(complaint.date)}</div>
            </div>
            <div class="complaint-meta">
                <span class="complaint-author">${complaint.author}</span>
                <span class="complaint-location">${complaint.location}</span>
            </div>
            <div class="complaint-category">${complaint.category}</div>
            <div class="status-badge status-${complaint.status}">
                ${getStatusText(complaint.status)}
            </div>
            <p>${complaint.description}</p>

            ${complaint.responses.map(response => `
                <div class="response card">
                    <div class="complaint-header">
                        <div class="complaint-title">Resposta da Prefeitura</div>
                        <div class="complaint-date">${formatDate(response.date)}</div>
                    </div>
                    <p>${response.text}</p>
                </div>
            `).join('')}

            <div class="response-form">
                <textarea class="form-control response-text" placeholder="Digite a resposta da prefeitura..." rows="3"></textarea>
                <div class="admin-actions">
                    <button class="btn btn-success send-response" data-id="${complaint.id}">Enviar Resposta</button>
                    <select class="form-control status-select" data-id="${complaint.id}">
                        <option value="pending" ${complaint.status === 'pending' ? 'selected' : ''}>Pendente</option>
                        <option value="in-progress" ${complaint.status === 'in-progress' ? 'selected' : ''}>Em Andamento</option>
                        <option value="resolved" ${complaint.status === 'resolved' ? 'selected' : ''}>Resolvido</option>
                    </select>
                </div>
            </div>
        `;

        adminComplaintsList.appendChild(complaintElement);
    });

    // Adicionar event listeners para os botões
    document.querySelectorAll('.send-response').forEach(button => {
        button.addEventListener('click', function() {
            const complaintId = parseInt(this.dataset.id);
            const responseText = this.parentElement.parentElement.querySelector('.response-text').value;

            if (!responseText.trim()) {
                alert('Por favor, digite uma resposta.');
                return;
            }

            addResponse(complaintId, responseText);
        });
    });

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            const complaintId = parseInt(this.dataset.id);
            updateComplaintStatus(complaintId, this.value);
        });
    });
}

function addResponse(complaintId, text) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        const newResponse = {
            id: complaint.responses.length + 1,
            text,
            author: currentUser.name,
            date: new Date().toISOString().split('T')[0]
        };

        complaint.responses.push(newResponse);
        localStorage.setItem('forum_complaints', JSON.stringify(complaints));
        loadAdminComplaints();
    }
}

function updateComplaintStatus(complaintId, status) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        complaint.status = status;
        localStorage.setItem('forum_complaints', JSON.stringify(complaints));
        loadAdminComplaints();
    }
}

// Funções auxiliares
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'in-progress': 'Em Andamento',
        'resolved': 'Resolvido'
    };
    return statusMap[status] || status;
}

function showLoginForm() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (currentUser) {
        updateNavigation();
        if (currentUser.role === 'citizen') {
            showPage(mainPage);
            loadComplaints();
        } else {
            showPage(adminPage);
            loadAdminComplaints();
        }
    } else {
        showPage(loginPage);
    }
});