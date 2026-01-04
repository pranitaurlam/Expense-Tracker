let transactions = [];
let isDark = false;
let isLoggedIn = false;

const categories = {
  food: { color: '#f87171', emoji: '🍔', name: 'Food' },
  transport: { color: '#60a5fa', emoji: '🚗', name: 'Transport' },
  travel: { color: '#f59e0b', emoji: '✈️', name: 'Travel' },
  shopping: { color: '#fbbf24', emoji: '🛒', name: 'Shopping' },
  entertainment: { color: '#a78bfa', emoji: '🎮', name: 'Entertainment' },
  salary: { color: '#10b981', emoji: '💼', name: 'Salary' },
  other: { color: '#6b7280', emoji: '📋', name: 'Other' }
};
/* ================= LOGIN ================= */
function login() {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorMsg = document.getElementById('errorMsg');

  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value;
  const password = passwordInput.value;

  if (username === 'pranita' && password === 'pranita') {
    localStorage.setItem('loggedIn', 'true');
    window.location.href = "index.html";
  } else {
    if (errorMsg) errorMsg.style.display = 'block';
  }
}
/* ================= AUTH CHECK ================= */
function checkAuth() {
  const mainApp = document.getElementById('mainApp');
  const isAuth = localStorage.getItem('loggedIn') === 'true';

  if (mainApp && !isAuth) {
    window.location.href = "login.html";
  }

  if (mainApp && isAuth) {
    isLoggedIn = true;
    initApp();
  }
}
/* ================= DATA ================= */
function saveData() {
  localStorage.setItem('pranita_expenses', JSON.stringify(transactions));
}

function updateDashboard() {
  const incomeEl = document.getElementById('income');
  const expenseEl = document.getElementById('expenses');
  const balanceEl = document.getElementById('balance');

  if (!incomeEl || !expenseEl || !balanceEl) return;

  const income = transactions.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  incomeEl.textContent = `₹${income.toLocaleString()}`;
  expenseEl.textContent = `₹${expense.toLocaleString()}`;
  balanceEl.textContent = `₹${(income - expense).toLocaleString()}`;
}
/* ================= CATEGORY ================= */
function renderCategoryBreakdown() {
  const container = document.getElementById('categoryList');
  if (!container) return;

  const categoryTotals = {};

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  if (Object.keys(categoryTotals).length === 0) {
    container.innerHTML = '<div class="no-data">No expenses yet!</div>';
    return;
  }

  container.innerHTML = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const info = categories[cat] || categories.other;
      return `
        <div class="category-item ${cat}">
          <div>${info.emoji} ${info.name}</div>
          <div class="category-amount">₹${amount.toLocaleString()}</div>
        </div>
      `;
    }).join('');
}
/* ================= TRANSACTIONS ================= */
function renderTransactions() {
  const container = document.getElementById('transactionList');
  if (!container) return;

  if (transactions.length === 0) {
    container.innerHTML = '<div class="no-data">No transactions yet!</div>';
    return;
  }

  container.innerHTML = transactions.slice(-5).reverse().map(t => {
    const info = categories[t.category] || categories.other;
    return `
      <div class="transaction-item">
        <div>
          <strong>${t.desc}</strong><br>
          <small style="color:${info.color}">
            ${info.emoji} ${info.name}
          </small>
        </div>
        <div>
          <span style="color:${t.type === 'income' ? '#10b981' : '#ef4444'}; font-weight:bold;">
            ${t.type === 'income' ? '+' : ''}₹${t.amount.toLocaleString()}
          </span><br>
          <button class="delete-btn" onclick="deleteTransaction('${t.id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}
/* ================= CRUD ================= */
function addTransaction() {
  const descEl = document.getElementById('desc');
  const amountEl = document.getElementById('amount');
  const typeEl = document.getElementById('type');
  const categoryEl = document.getElementById('category');

  if (!descEl || !amountEl || !typeEl || !categoryEl) return;

  const desc = descEl.value.trim();
  const amount = parseFloat(amountEl.value);

  if (!desc || !amount || amount <= 0) {
    alert('Please fill all fields correctly');
    return;
  }

  transactions.unshift({
    id: Date.now().toString(),
    desc,
    amount,
    type: typeEl.value,
    category: categoryEl.value,
    date: new Date().toISOString()
  });

  saveData();
  descEl.value = '';
  amountEl.value = '';
  updateAll();
}

function deleteTransaction(id) {
  if (confirm('Delete this transaction?')) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateAll();
  }
}
/* ================= INIT ================= */
function updateAll() {
  updateDashboard();
  renderCategoryBreakdown();
  renderTransactions();
}

function initApp() {
  updateAll();
}
/* ================= EVENTS ================= */
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  const userInput = document.getElementById('username');
  const passInput = document.getElementById('password');

  if (userInput && passInput) {
    userInput.value = 'pranita';
    passInput.value = 'pranita';
  }
});

document.addEventListener('keypress', e => {
  if (e.key === 'Enter' && isLoggedIn) addTransaction();
  if (e.key === 'Enter' && !isLoggedIn) login();
});
