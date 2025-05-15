const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-amount');
const budgetInfo = document.getElementById('budget-info');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let budget = parseFloat(localStorage.getItem('budget')) || 0;

loadBudgetFromBackend();
loadTransactionsFromBackend();

function renderTransactions() {
  list.innerHTML = '';
  transactions.forEach((tx) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    li.classList.add(tx.type === 'income' ? 'list-group-item-success' : 'list-group-item-danger');
    li.innerHTML = `
      ${tx.type.toUpperCase()}: ${tx.description} - ${tx.amount.toFixed(2)} PLN
      <button class="btn btn-sm btn-outline-dark ms-3" onclick="deleteTransaction('${tx._id}')">🗑</button>
    `;
    list.appendChild(li);
  });

  renderBudgetInfo();
  renderChart();
}

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx._id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();

  if (navigator.onLine) {
    fetch(`http://localhost:3000/transactions/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Błąd usuwania z MongoDB:', err));
  } else {
    console.warn('Jesteś offline - usunięto tylko lokalnie');
  }
}



form.addEventListener('submit', (e) => {
  e.preventDefault();
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  const transaction = {
    description,
    amount,
    type,
    date: new Date().toISOString()
  };

  if (navigator.onLine) {
    fetch('http://localhost:3000/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    })
    .then(res => res.json())
    .then(savedTx => {
      transactions.push(savedTx);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      renderTransactions();
      form.reset();
    })
    .catch(err => {
      console.error('Błąd zapisu do MongoDB:', err);
    });
  } else {
    console.warn('Jesteś offline - transakcja zapisana tylko lokalnie');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions();
    form.reset();
  }
});

budgetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  budget = parseFloat(budgetInput.value);

  fetch('http://localhost:3000/budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: budget })
  })
  .catch(err => console.error('Błąd zapisu do MongoDB:', err))
  .then(() => {
    localStorage.setItem('budget', budget);
    renderBudgetInfo();
    budgetForm.reset();
  });
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

      fetch('http://localhost:3000/notify', { method: 'POST' });
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

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const labels = ['Income', 'Expenses'];
  const data = [totalIncome, totalExpenses];

  if (data.length === 0) return;

  if (expenseChart) {
    expenseChart.destroy();
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

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('service-worker.js')
    .then(swReg => {
      console.log('Service Worker zarejestrowany');

      return swReg.pushManager.getSubscription()
        .then(sub => {
          if (sub === null) {
            const vapidPublicKey = 'BE1d8uj_T8Am8YusGlelB_gkeeDgKALCoMiJl0_WXa0OehD-RHGT_LjbfAZbgNRsOSkRgU9bBD2l4aDYcbD1wbI';
            const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
            return swReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedKey
            });
          }
          return sub;
        });
    })
    .then(sub => {
      fetch('http://localhost:3000/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });
    })
    .catch(console.error);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function loadTransactionsFromBackend() {
  if (!navigator.onLine) {
    console.warn('Brak internetu - dane z localStorage');
    renderTransactions();
  } else {
    fetch('http://localhost:3000/transactions')
    .then(response => response.json())
    .then(data => {
      transactions = data;
      localStorage.setItem('transactions', JSON.stringify(transactions));
      renderTransactions();
    })
    .catch(err => {
      console.error('Błąd pobierania z backendu:', err);
      renderTransactions(); //fallback
    });
  }

}

function loadBudgetFromBackend() {
  if (!navigator.onLine) {
    console.warn('Offline - budżet z localStorage');
    budget = parseFloat(localStorage.getItem('budget')) || 0;
    renderBudgetInfo();
  } else {
    fetch('http://localhost:3000/budget')
      .then(res => res.json())
      .then(data => {
        budget = data.amount;
        localStorage.setItem('budget', budget);
        renderBudgetInfo();
      })
      .catch(err => {
        console.error('Błąd pobierania budżetu:', err);
        renderBudgetInfo();
      });
  }
}

window.addEventListener('online', () => {
  console.log('Połączono z internetem – odświeżam dane z serwera');
  loadBudgetFromBackend();
  loadTransactionsFromBackend();
});

window.addEventListener('offline', () => {
  console.warn('Utracono połączenie – korzystasz z danych lokalnych');
});
