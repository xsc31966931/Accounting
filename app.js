// 初始化数据存储
if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([]));
}
if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify([]));
}
if (!localStorage.getItem('accounts')) {
    localStorage.setItem('accounts', JSON.stringify([]));
}
if (!localStorage.getItem('budgets')) {
    localStorage.setItem('budgets', JSON.stringify([]));
}

// 获取 DOM 元素
const transactionForm = document.getElementById('transaction-form');
const transactionTableBody = document.querySelector('#transaction-table tbody');
const categoryForm = document.getElementById('category-form');
const categoryList = document.getElementById('category-list');
const accountForm = document.getElementById('account-form');
const accountList = document.getElementById('account-list');
const budgetForm = document.getElementById('budget-form');
const budgetStatus = document.getElementById('budget-status');
const reportForm = document.getElementById('report-form');
const chartCanvas = document.getElementById('chart');

// 初始化图表
let chart = null;

// 加载数据
function loadData() {
    loadTransactions();
    loadCategories();
    loadAccounts();
    loadBudgets();
    updateReport();
}

// 加载交易记录
function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    transactionTableBody.innerHTML = '';
    transactions.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.description}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.type === 'income' ? '收入' : '支出'}</td>
            <td>${transaction.category}</td>
            <td>${transaction.account}</td>
            <td>
                <button onclick="editTransaction(${index})">编辑</button>
                <button onclick="deleteTransaction(${index})">删除</button>
            </td>
        `;
        transactionTableBody.appendChild(row);
    });
}

// 添加交易记录
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const transaction = {
        date: document.getElementById('transaction-date').value,
        description: document.getElementById('transaction-description').value,
        amount: parseFloat(document.getElementById('transaction-amount').value),
        type: document.getElementById('transaction-type').value,
        category: document.getElementById('transaction-category').value,
        account: document.getElementById('transaction-account').value
    };
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    loadTransactions();
    transactionForm.reset();
});

// 编辑交易记录
window.editTransaction = function(index) {
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    const transaction = transactions[index];
    document.getElementById('transaction-date').value = transaction.date;
    document.getElementById('transaction-description').value = transaction.description;
    document.getElementById('transaction-amount').value = transaction.amount;
    document.getElementById('transaction-type').value = transaction.type;
    document.getElementById('transaction-category').value = transaction.category;
    document.getElementById('transaction-account').value = transaction.account;
    // 移除旧记录
    transactions.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    loadTransactions();
};

// 删除交易记录
window.deleteTransaction = function(index) {
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    transactions.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    loadTransactions();
};

// 加载分类
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories'));
    categoryList.innerHTML = '';
    const categorySelect = document.getElementById('transaction-category');
    const reportCategorySelect = document.getElementById('report-category');
    categorySelect.innerHTML = '';
    reportCategorySelect.innerHTML = '<option value="">全部</option>';
    categories.forEach((category, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${category.name} (${category.type === 'income' ? '收入' : '支出'})
            <button onclick="deleteCategory(${index})">删除</button>
        `;
        categoryList.appendChild(li);

        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);

        const reportOption = document.createElement('option');
        reportOption.value = category.name;
        reportOption.textContent = category.name;
        reportCategorySelect.appendChild(reportOption);
    });
}

// 添加分类
categoryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const category = {
        name: document.getElementById('category-name').value,
        type: document.getElementById('category-type').value
    };
    const categories = JSON.parse(localStorage.getItem('categories'));
    categories.push(category);
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategories();
    categoryForm.reset();
});

// 删除分类
window.deleteCategory = function(index) {
    const categories = JSON.parse(localStorage.getItem('categories'));
    categories.splice(index, 1);
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategories();
};

// 加载账户
function loadAccounts() {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    accountList.innerHTML = '';
    const accountSelect = document.getElementById('transaction-account');
    const reportAccountSelect = document.getElementById('report-account');
    accountSelect.innerHTML = '';
    reportAccountSelect.innerHTML = '<option value="">全部</option>';
    accounts.forEach((account, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${account.name}
            <button onclick="deleteAccount(${index})">删除</button>
        `;
        accountList.appendChild(li);

        const option = document.createElement('option');
        option.value = account.name;
        option.textContent = account.name;
        accountSelect.appendChild(option);

        const reportOption = document.createElement('option');
        reportOption.value = account.name;
        reportOption.textContent = account.name;
        reportAccountSelect.appendChild(reportOption);
    });
}

// 添加账户
accountForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const account = {
        name: document.getElementById('account-name').value
    };
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    accounts.push(account);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadAccounts();
    accountForm.reset();
});

// 删除账户
window.deleteAccount = function(index) {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    accounts.splice(index, 1);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadAccounts();
};

// 加载预算
function loadBudgets() {
    const budgets = JSON.parse(localStorage.getItem('budgets'));
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budget = budgets.find(b => b.month === currentMonth);
    if (budget) {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const totalExpense = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        budgetStatus.textContent = `本月预算: ${budget.amount} 元，已支出: ${totalExpense} 元，剩余: ${budget.amount - totalExpense} 元`;
    } else {
        budgetStatus.textContent = '本月未设置预算';
    }
}

// 设置预算
budgetForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const budget = {
        month: document.getElementById('budget-month').value,
        amount: parseFloat(document.getElementById('budget-amount').value)
    };
    const budgets = JSON.parse(localStorage.getItem('budgets'));
    const index = budgets.findIndex(b => b.month === budget.month);
    if (index > -1) {
        budgets[index] = budget;
    } else {
        budgets.push(budget);
    }
    localStorage.setItem('budgets', JSON.stringify(budgets));
    loadBudgets();
    budgetForm.reset();
});

// 生成报表
reportForm.addEventListener('submit', function(e) {
    e.preventDefault();
    updateReport();
});

function updateReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const category = document.getElementById('report-category').value;
    const account = document.getElementById('report-account').value;

    const transactions = JSON.parse(localStorage.getItem('transactions'));
    let filteredTransactions = transactions;

    if (startDate) {
        filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
        filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
    }
    if (category) {
        filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }
    if (account) {
        filteredTransactions = filteredTransactions.filter(t => t.account === account);
    }

    const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(chartCanvas, {
        type: 'pie',
        data: {
            labels: ['收入', '支出'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: '收支分布'
            }
        }
    });
}

// 初始化加载数据
loadData();