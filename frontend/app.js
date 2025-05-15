const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-amount');
const budgetInfo = document.getElementById('budget-info');

let transactions = [];
let budget = parseFloat(localStorage.getItem('budget')) || 0;

function renderTransactions() {
  list.innerHTML = '';
  transactions.forEach((tx, index) => {
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
  fetch(`http://localhost:3000/transactions/${id}`, {
    method: 'DELETE'
  }).then(() => {
    // delete from localstorage
    transactions = transactions.filter(tx => tx._id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions();
  });
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

  // save in local storage
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
  form.reset();

  // send to DB
  fetch('http://localhost:3000/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  }).catch(err => console.error('Error while saveing transaction in database:', err));
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
  fetch('http://localhost:3000/transactions')
    .then(response => response.json())
    .then(data => {
      transactions = data;
      localStorage.setItem('transactions', JSON.stringify(transactions)); // opcjonalne cache
      renderTransactions();
    })
    .catch(err => console.error('Błąd pobierania danych z backendu:', err));
}

loadTransactionsFromBackend();
