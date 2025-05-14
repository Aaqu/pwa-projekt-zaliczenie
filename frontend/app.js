const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function renderTransactions() {
  list.innerHTML = '';
  transactions.forEach((tx) => {
    const li = document.createElement('li');
    li.textContent = `${tx.type.toUpperCase()}: ${tx.description} - ${tx.amount.toFixed(2)} PLN`;
    li.classList.add(tx.type === 'income' ? 'income' : 'expense');
    list.appendChild(li);
  });

  renderBudgetInfo();
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

const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-amount');
const budgetInfo = document.getElementById('budget-info');

let budget = parseFloat(localStorage.getItem('budget')) || 0;

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
      budgetInfo.className = 'budget-exceeded';
      budgetInfo.textContent += ' – Budget exceeded!';
    } else {
      budgetInfo.className = 'budget-ok';
    }
  } else {
    budgetInfo.textContent = 'No budget set';
    budgetInfo.className = '';
  }
}

renderTransactions();