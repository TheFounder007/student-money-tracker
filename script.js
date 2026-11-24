// ========== ELEMENT REFERENCES ==========
const form = document.getElementById("expenseForm");
const nameInput = document.getElementById("expenseName");
const amountInput = document.getElementById("expenseAmount");
const categoryInput = document.getElementById("expenseCategory");
const nameError = document.getElementById("nameError");
const amountError = document.getElementById("amountError");

const filterSelect = document.getElementById("filterCategory");
const expenseList = document.getElementById("expenseList");
const emptyMessage = document.getElementById("emptyMessage");
const totalAmountEl = document.getElementById("totalAmount");
const expenseCountEl = document.getElementById("expenseCount");
const filterTotalEl = document.getElementById("filterTotal");

// ========== DATA ==========
let expenses = [];
let nextId = 1;

// ========== HELPERS ==========
function formatMoney(value) {
  return "₹" + value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function clearErrors() {
  nameError.textContent = "";
  amountError.textContent = "";
  nameInput.classList.remove("invalid");
  amountInput.classList.remove("invalid");
}

// ========== ADD EXPENSE ==========
form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearErrors();

  const name = nameInput.value.trim();
  const amountRaw = amountInput.value.trim();
  const amount = Number(amountRaw);
  let isValid = true;

  // Validate name
  if (name === "") {
    nameError.textContent = "Please enter an expense name.";
    nameInput.classList.add("invalid");
    isValid = false;
  }

  // Validate amount
  if (amountRaw === "") {
    amountError.textContent = "Please enter an amount.";
    amountInput.classList.add("invalid");
    isValid = false;
  } else if (!Number.isFinite(amount)) {
    amountError.textContent = "Please enter a valid number.";
    amountInput.classList.add("invalid");
    isValid = false;
  } else if (amount <= 0) {
    amountError.textContent = "Amount must be greater than zero.";
    amountInput.classList.add("invalid");
    isValid = false;
  }

  if (!isValid) return;

  expenses.push({
    id: nextId++,
    name: name,
    amount: amount,
    category: categoryInput.value
  });

  form.reset();
  nameInput.focus();
  render();
});

// ========== DELETE EXPENSE (event delegation) ==========
expenseList.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".btn-delete");
  if (!deleteBtn) return;

  const id = Number(deleteBtn.closest(".expense-item").dataset.id);
  expenses = expenses.filter(expense => expense.id !== id);
  render();
});

// ========== FILTER ==========
filterSelect.addEventListener("change", render);

// ========== RENDER ==========
function render() {
  const selectedCategory = filterSelect.value;

  const visibleExpenses = selectedCategory === "All"
    ? expenses
    : expenses.filter(expense => expense.category === selectedCategory);

  // Clear and rebuild the list
  expenseList.innerHTML = "";

  visibleExpenses.forEach(expense => {
    const li = document.createElement("li");
    li.className = "expense-item";
    li.dataset.id = expense.id;

    // Left side: name and category tag
    const info = document.createElement("div");
    info.className = "expense-info";

    const nameSpan = document.createElement("span");
    nameSpan.className = "expense-name";
    nameSpan.textContent = expense.name;

    const tag = document.createElement("span");
    tag.className = "tag tag-" + expense.category.toLowerCase();
    tag.textContent = expense.category;

    info.append(nameSpan, tag);

    // Right side: amount and delete button
    const right = document.createElement("div");
    right.className = "expense-right";

    const amountSpan = document.createElement("span");
    amountSpan.className = "expense-amount";
    amountSpan.textContent = formatMoney(expense.amount);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", "Delete " + expense.name);

    right.append(amountSpan, deleteBtn);
    li.append(info, right);
    expenseList.appendChild(li);
  });

  // Empty message
  if (visibleExpenses.length === 0) {
    emptyMessage.style.display = "block";
    emptyMessage.textContent = expenses.length === 0
      ? "No expenses yet. Add your first one above!"
      : "No expenses in this category.";
  } else {
    emptyMessage.style.display = "none";
  }

  // Totals
  const totalAll = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalFiltered = visibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  totalAmountEl.textContent = formatMoney(totalAll);
  expenseCountEl.textContent = expenses.length + (expenses.length === 1 ? " expense" : " expenses");
  filterTotalEl.textContent = (selectedCategory === "All" ? "All" : selectedCategory) + " total: " + formatMoney(totalFiltered);
}

// Initial render
render();