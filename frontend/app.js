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

renderTransactions();
