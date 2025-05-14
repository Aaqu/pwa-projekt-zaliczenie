const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-amount');
const budgetInfo = document.getElementById('budget-info');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let budget = parseFloat(localStorage.getItem('budget')) || 0;

function renderTransactions() {
  list.innerHTML = '';
  transactions.forEach((tx, index) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    li.classList.add(tx.type === 'income' ? 'list-group-item-success' : 'list-group-item-danger');
    li.innerHTML = `
      ${tx.type.toUpperCase()}: ${tx.description} - ${tx.amount.toFixed(2)} PLN
      <button class="btn btn-sm btn-outline-dark ms-3" onclick="deleteTransaction(${index})">🗑</button>
    `;
    list.appendChild(li);
  });

  renderBudgetInfo();
  renderChart();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  const transaction = { description, amount, type, date: new Date().toISOString() };
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
  form.reset();
});

budgetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  budget = parseFloat(budgetInput.value);
  localStorage.setItem('budget', budget);
  renderBudgetInfo();
  budgetForm.reset();
});

function renderBudgetInfo() {
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (budget > 0) {
    budgetInfo.textContent = `Spent ${totalExpenses.toFixed(2)} / ${budget.toFixed(2)} PLN`;
    if (totalExpenses > budget) {
      budgetInfo.className = 'text-danger fw-bold';
      budgetInfo.textContent += ' – Budget exceeded!';
    } else {
      budgetInfo.className = 'text-success fw-bold';
    }
  } else {
    budgetInfo.textContent = 'No budget set';
    budgetInfo.className = '';
  }
}
let expenseChart = null;

function renderChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');

  const expenseData = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (expenseData[t.description]) {
        expenseData[t.description] += t.amount;
      } else {
        expenseData[t.description] = t.amount;
      }
    });

  const labels = Object.keys(expenseData);
  const data = Object.values(expenseData);

  if (expenseChart) {
    expenseChart.destroy(); // usuń stary wykres, jeśli istnieje
  }

  expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses',
        data: data,
        backgroundColor: [
          '#e74c3c', '#f1c40f', '#2ecc71', '#3498db',
          '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}


renderTransactions();
