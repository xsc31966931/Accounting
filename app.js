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
const analysisForm = document.getElementById('analysis-form');
const analysisResult = document.getElementById('analysis-result');

// 初始化图表
let expenseBarChart = null;
let expensePieChart = null;
let incomeBarChart = null;
let incomePieChart = null;

// 加载数据
function loadData() {
    loadTransactions();
    loadCategories();
    loadAccounts();
    loadBudgets();
    populateYearSelect();
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
    updateAccountBalances();
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
    categorySelect.innerHTML = '';
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

// 计算账户余额
function calculateAccountBalance(accountName) {
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const account = accounts.find(a => a.name === accountName);
    
    if (!account) return 0;
    
    let balance = parseFloat(account.initialBalance || 0);
    
    transactions.forEach(transaction => {
        if (transaction.account === accountName) {
            if (transaction.type === 'income') {
                balance += parseFloat(transaction.amount);
            } else {
                balance -= parseFloat(transaction.amount);
            }
        }
    });
    
    return balance;
}

// 更新账户余额显示
function updateAccountBalances() {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const accountItems = document.querySelectorAll('#account-list li');
    
    accountItems.forEach((item, index) => {
        const accountName = accounts[index].name;
        const balance = calculateAccountBalance(accountName);
        
        const balanceSpan = item.querySelector('.account-balance');
        if (balanceSpan) {
            balanceSpan.textContent = `余额: ${balance.toFixed(2)}`;
            balanceSpan.className = `account-balance ${balance >= 0 ? 'positive-balance' : 'negative-balance'}`;
        }
    });
}

// 加载账户
function loadAccounts() {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    accountList.innerHTML = '';
    const accountSelect = document.getElementById('transaction-account');
    accountSelect.innerHTML = '';
    accounts.forEach((account, index) => {
        const balance = calculateAccountBalance(account.name);
        
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                ${account.name}
                <span class="account-balance ${balance >= 0 ? 'positive-balance' : 'negative-balance'}">余额: ${balance.toFixed(2)}</span>
                <button class="edit-balance" onclick="editAccountBalance(${index})">修改余额</button>
            </div>
            <button onclick="deleteAccount(${index})">删除</button>
        `;
        accountList.appendChild(li);

        const option = document.createElement('option');
        option.value = account.name;
        option.textContent = account.name;
        accountSelect.appendChild(option);
    });
}

// 添加账户
accountForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const account = {
        name: document.getElementById('account-name').value,
        initialBalance: parseFloat(document.getElementById('account-balance').value || 0)
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

// 编辑账户余额
window.editAccountBalance = function(index) {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const account = accounts[index];
    const currentBalance = calculateAccountBalance(account.name);
    
    const newBalance = prompt(`请输入 ${account.name} 的新余额:`, currentBalance);
    if (newBalance === null) return;
    
    const parsedBalance = parseFloat(newBalance);
    if (isNaN(parsedBalance)) {
        alert('请输入有效的数字!');
        return;
    }
    
    // 创建一个调整交易记录来反映新的余额
    const adjustmentAmount = Math.abs(parsedBalance - currentBalance);
    if (adjustmentAmount === 0) return;
    
    const adjustmentType = parsedBalance > currentBalance ? 'income' : 'expense';
    
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    transactions.push({
        date: new Date().toISOString().slice(0, 10),
        description: `余额调整 - ${account.name}`,
        amount: adjustmentAmount,
        type: adjustmentType,
        category: adjustmentType === 'income' ? '余额调整(收入)' : '余额调整(支出)',
        account: account.name
    });
    
    localStorage.setItem('transactions', JSON.stringify(transactions));
    loadTransactions();
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
    generateReports();
});

// 生成所有报表
function generateReports() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;

    const transactions = JSON.parse(localStorage.getItem('transactions'));
    let filteredTransactions = transactions;

    if (startDate) {
        filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
        filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
    }

    // 收入和支出交易
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

    // 按分类汇总
    const incomeByCategory = {};
    const expenseByCategory = {};

    incomeTransactions.forEach(t => {
        if (!incomeByCategory[t.category]) {
            incomeByCategory[t.category] = 0;
        }
        incomeByCategory[t.category] += parseFloat(t.amount);
    });

    expenseTransactions.forEach(t => {
        if (!expenseByCategory[t.category]) {
            expenseByCategory[t.category] = 0;
        }
        expenseByCategory[t.category] += parseFloat(t.amount);
    });

    // 生成图表数据
    const incomeCategoryLabels = Object.keys(incomeByCategory);
    const incomeCategoryData = incomeCategoryLabels.map(cat => incomeByCategory[cat]);
    const expenseCategoryLabels = Object.keys(expenseByCategory);
    const expenseCategoryData = expenseCategoryLabels.map(cat => expenseByCategory[cat]);

    // 生成图表
    generateExpenseBarChart(expenseCategoryLabels, expenseCategoryData);
    generateExpensePieChart(expenseCategoryLabels, expenseCategoryData);
    generateIncomeBarChart(incomeCategoryLabels, incomeCategoryData);
    generateIncomePieChart(incomeCategoryLabels, incomeCategoryData);
}

// 生成支出柱状图
function generateExpenseBarChart(labels, data) {
    const ctx = document.getElementById('expense-bar-chart').getContext('2d');
    
    if (expenseBarChart) {
        expenseBarChart.destroy();
    }
    
    expenseBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '支出金额',
                data: data,
                backgroundColor: 'rgba(220, 53, 69, 0.7)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 生成支出饼图
function generateExpensePieChart(labels, data) {
    const ctx = document.getElementById('expense-pie-chart').getContext('2d');
    
    if (expensePieChart) {
        expensePieChart.destroy();
    }
    
    // 生成不同颜色
    const backgroundColors = labels.map((_, i) => {
        const hue = (i * 30) % 360;
        return `hsla(${hue}, 70%, 60%, 0.7)`;
    });
    
    expensePieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// 生成收入柱状图
function generateIncomeBarChart(labels, data) {
    const ctx = document.getElementById('income-bar-chart').getContext('2d');
    
    if (incomeBarChart) {
        incomeBarChart.destroy();
    }
    
    incomeBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '收入金额',
                data: data,
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 生成收入饼图
function generateIncomePieChart(labels, data) {
    const ctx = document.getElementById('income-pie-chart').getContext('2d');
    
    if (incomePieChart) {
        incomePieChart.destroy();
    }
    
    // 生成不同颜色
    const backgroundColors = labels.map((_, i) => {
        const hue = (i * 30 + 120) % 360;
        return `hsla(${hue}, 70%, 60%, 0.7)`;
    });
    
    incomePieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// 填充年份选择器
function populateYearSelect() {
    const yearSelect = document.getElementById('analysis-year');
    yearSelect.innerHTML = '';
    
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
    
    // 默认设置当前月份
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    document.getElementById('analysis-month').value = currentMonth;
}

// 显示/隐藏月份选择器
document.getElementById('analysis-period').addEventListener('change', function() {
    const monthSelect = document.getElementById('analysis-month');
    if (this.value === 'month') {
        monthSelect.style.display = 'inline-block';
    } else {
        monthSelect.style.display = 'none';
    }
});

// 收支分析
analysisForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const period = document.getElementById('analysis-period').value;
    const year = document.getElementById('analysis-year').value;
    const month = document.getElementById('analysis-month').value;
    
    generateAnalysisReport(period, year, month);
});

// 生成分析报告
function generateAnalysisReport(period, year, month) {
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    const budgets = JSON.parse(localStorage.getItem('budgets'));
    let filteredTransactions;
    let report = '';
    
    if (period === 'month') {
        // 按月分析
        const yearMonth = `${year}-${month}`;
        filteredTransactions = transactions.filter(t => t.date.startsWith(yearMonth));
        
        // 获取该月预算
        const budget = budgets.find(b => b.month === yearMonth);
        const budgetAmount = budget ? parseFloat(budget.amount) : 0;
        
        // 按分类汇总支出
        const expenseByCategory = {};
        const incomeByCategory = {};
        
        filteredTransactions.forEach(t => {
            if (t.type === 'expense') {
                if (!expenseByCategory[t.category]) {
                    expenseByCategory[t.category] = 0;
                }
                expenseByCategory[t.category] += parseFloat(t.amount);
            } else {
                if (!incomeByCategory[t.category]) {
                    incomeByCategory[t.category] = 0;
                }
                incomeByCategory[t.category] += parseFloat(t.amount);
            }
        });
        
        // 计算总收支
        const totalExpense = Object.values(expenseByCategory).reduce((sum, amount) => sum + amount, 0);
        const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0);
        const balance = totalIncome - totalExpense;
        
        // 找出最大支出分类
        let maxExpenseCategory = '';
        let maxExpenseAmount = 0;
        
        Object.keys(expenseByCategory).forEach(category => {
            if (expenseByCategory[category] > maxExpenseAmount) {
                maxExpenseCategory = category;
                maxExpenseAmount = expenseByCategory[category];
            }
        });
        
        // 计算支出占比
        const expenseRatio = {};
        Object.keys(expenseByCategory).forEach(category => {
            expenseRatio[category] = (expenseByCategory[category] / totalExpense * 100).toFixed(1);
        });
        
        // 智能分析
        const insights = [];
        
        // 预算分析
        if (budgetAmount > 0) {
            const budgetUsagePercent = (totalExpense / budgetAmount * 100).toFixed(1);
            if (totalExpense > budgetAmount) {
                insights.push(`<li class="analysis-warning">本月支出 ${totalExpense.toFixed(2)} 元，超出预算 ${(totalExpense - budgetAmount).toFixed(2)} 元 (${budgetUsagePercent}%)。建议控制支出。</li>`);
            } else if (totalExpense > budgetAmount * 0.9) {
                insights.push(`<li class="analysis-warning">本月支出接近预算上限，已使用预算的 ${budgetUsagePercent}%。</li>`);
            } else {
                insights.push(`<li class="analysis-success">本月支出在预算范围内，已使用预算的 ${budgetUsagePercent}%。</li>`);
            }
        }
        
        // 收支平衡分析
        if (balance < 0) {
            insights.push(`<li class="analysis-warning">本月支出大于收入，赤字 ${Math.abs(balance).toFixed(2)} 元。建议减少非必要开支。</li>`);
        } else if (balance < totalIncome * 0.1) {
            insights.push(`<li class="analysis-warning">本月结余较少，仅为收入的 ${(balance / totalIncome * 100).toFixed(1)}%。建议增加储蓄。</li>`);
        } else {
            insights.push(`<li class="analysis-success">本月收支平衡良好，结余 ${balance.toFixed(2)} 元，占收入的 ${(balance / totalIncome * 100).toFixed(1)}%。</li>`);
        }
        
        // 支出结构分析
        if (maxExpenseCategory && maxExpenseAmount > totalExpense * 0.5) {
            insights.push(`<li class="analysis-warning">"${maxExpenseCategory}" 类别支出占比过高 (${expenseRatio[maxExpenseCategory]}%)，建议检查是否合理。</li>`);
        }
        
        // 支出分类过于集中
        const significantCategories = Object.keys(expenseByCategory).filter(cat => expenseByCategory[cat] > totalExpense * 0.15).length;
        if (Object.keys(expenseByCategory).length > 3 && significantCategories <= 2) {
            insights.push(`<li class="analysis-warning">支出过于集中在少数几个类别，建议更均衡地分配支出。</li>`);
        }
        
        // 生成报告
        report = `
            <h3>${year}年${parseInt(month)}月收支分析报告</h3>
            <p>本月总收入: <span class="analysis-highlight">${totalIncome.toFixed(2)}</span> 元</p>
            <p>本月总支出: <span class="analysis-highlight">${totalExpense.toFixed(2)}</span> 元</p>
            <p>本月结余: <span class="${balance >= 0 ? 'analysis-success' : 'analysis-warning'}">${balance.toFixed(2)}</span> 元</p>
            
            ${budgetAmount > 0 ? `<p>本月预算: ${budgetAmount.toFixed(2)} 元 (已使用 ${(totalExpense / budgetAmount * 100).toFixed(1)}%)</p>` : ''}
            
            <h4>支出分类占比:</h4>
            <ul>
                ${Object.keys(expenseByCategory).map(category => 
                    `<li>${category}: ${expenseByCategory[category].toFixed(2)} 元 (${expenseRatio[category]}%)</li>`
                ).join('')}
            </ul>
            
            <h4>智能分析建议:</h4>
            <ul>
                ${insights.join('')}
            </ul>
        `;
    } else {
        // 按年分析
        filteredTransactions = transactions.filter(t => t.date.startsWith(year));
        
        // 按分类汇总支出
        const expenseByCategory = {};
        const incomeByCategory = {};
        
        filteredTransactions.forEach(t => {
            if (t.type === 'expense') {
                if (!expenseByCategory[t.category]) {
                    expenseByCategory[t.category] = 0;
                }
                expenseByCategory[t.category] += parseFloat(t.amount);
            } else {
                if (!incomeByCategory[t.category]) {
                    incomeByCategory[t.category] = 0;
                }
                incomeByCategory[t.category] += parseFloat(t.amount);
            }
        });
        
        // 计算总收支
        const totalExpense = Object.values(expenseByCategory).reduce((sum, amount) => sum + amount, 0);
        const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0);
        const balance = totalIncome - totalExpense;
        
        // 按月统计支出趋势
        const monthlyExpense = {};
        const monthlyIncome = {};
        
        for (let i = 1; i <= 12; i++) {
            const monthStr = i.toString().padStart(2, '0');
            monthlyExpense[monthStr] = 0;
            monthlyIncome[monthStr] = 0;
        }
        
        filteredTransactions.forEach(t => {
            const month = t.date.slice(5, 7);
            if (t.type === 'expense') {
                monthlyExpense[month] += parseFloat(t.amount);
            } else {
                monthlyIncome[month] += parseFloat(t.amount);
            }
        });
        
        // 找出支出最高的月份和分类
        let maxExpenseMonth = '01';
        Object.keys(monthlyExpense).forEach(month => {
            if (monthlyExpense[month] > monthlyExpense[maxExpenseMonth]) {
                maxExpenseMonth = month;
            }
        });
        
        let maxExpenseCategory = '';
        let maxExpenseAmount = 0;
        Object.keys(expenseByCategory).forEach(category => {
            if (expenseByCategory[category] > maxExpenseAmount) {
                maxExpenseCategory = category;
                maxExpenseAmount = expenseByCategory[category];
            }
        });
        
        // 计算支出占比
        const expenseRatio = {};
        Object.keys(expenseByCategory).forEach(category => {
            expenseRatio[category] = (expenseByCategory[category] / totalExpense * 100).toFixed(1);
        });
        
        // 智能分析
        const insights = [];
        
        // 收支平衡分析
        if (balance < 0) {
            insights.push(`<li class="analysis-warning">全年支出大于收入，赤字 ${Math.abs(balance).toFixed(2)} 元。建议制定更严格的预算计划。</li>`);
        } else if (balance < totalIncome * 0.1) {
            insights.push(`<li class="analysis-warning">全年结余较少，仅为收入的 ${(balance / totalIncome * 100).toFixed(1)}%。建议增加储蓄。</li>`);
        } else {
            insights.push(`<li class="analysis-success">全年收支平衡良好，结余 ${balance.toFixed(2)} 元，占收入的 ${(balance / totalIncome * 100).toFixed(1)}%。</li>`);
        }
        
        // 支出结构分析
        if (maxExpenseCategory && maxExpenseAmount > totalExpense * 0.4) {
            insights.push(`<li class="analysis-warning">"${maxExpenseCategory}" 类别支出占比过高 (${expenseRatio[maxExpenseCategory]}%)，建议检查是否合理。</li>`);
        }
        
        // 月度支出波动分析
        const monthlyExpenseValues = Object.values(monthlyExpense).filter(v => v > 0);
        if (monthlyExpenseValues.length > 0) {
            const avgMonthlyExpense = monthlyExpenseValues.reduce((sum, v) => sum + v, 0) / monthlyExpenseValues.length;
            if (monthlyExpense[maxExpenseMonth] > avgMonthlyExpense * 1.5) {
                insights.push(`<li class="analysis-warning">${parseInt(maxExpenseMonth)}月支出明显高于平均水平，建议检查该月支出是否有特殊情况。</li>`);
            }
        }
        
        // 支出多样性分析
        if (Object.keys(expenseByCategory).length <= 3 && totalExpense > 0) {
            insights.push(`<li class="analysis-warning">支出分类较少，建议更详细地记录不同类别的支出。</li>`);
        }
        
        // 生成报告
        report = `
            <h3>${year}年收支分析报告</h3>
            <p>全年总收入: <span class="analysis-highlight">${totalIncome.toFixed(2)}</span> 元</p>
            <p>全年总支出: <span class="analysis-highlight">${totalExpense.toFixed(2)}</span> 元</p>
            <p>全年结余: <span class="${balance >= 0 ? 'analysis-success' : 'analysis-warning'}">${balance.toFixed(2)}</span> 元</p>
            
            <h4>支出分类占比:</h4>
            <ul>
                ${Object.keys(expenseByCategory).map(category => 
                    `<li>${category}: ${expenseByCategory[category].toFixed(2)} 元 (${expenseRatio[category]}%)</li>`
                ).join('')}
            </ul>
            
            <h4>月度支出趋势:</h4>
            <ul>
                ${Object.keys(monthlyExpense).filter(month => monthlyExpense[month] > 0).map(month => 
                    `<li>${parseInt(month)}月: ${monthlyExpense[month].toFixed(2)} 元</li>`
                ).join('')}
            </ul>
            
            <h4>智能分析建议:</h4>
            <ul>
                ${insights.join('')}
            </ul>
        `;
    }
    
    analysisResult.innerHTML = report;
}

// 初始化加载数据
loadData();