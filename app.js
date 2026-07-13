// ========================================
// SETTINGS
// ========================================

const MONTHLY_BUDGET = 20000;

let transactions = [];

let expenseChart = null;

// ========================================
// INITIALIZE APP
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    loadTransactions();

    document
        .getElementById("addBtn")
        .addEventListener(
            "click",
            addTransaction
        );

    document
        .getElementById("themeBtn")
        .addEventListener(
            "click",
            toggleTheme
        );

    document
        .getElementById("exportBtn")
        .addEventListener(
            "click",
            exportData
        );

    document
        .getElementById("importFile")
        .addEventListener(
            "change",
            importData
        );

});

// ========================================
// ADD TRANSACTION
// ========================================

function addTransaction() {

    const description =
        document
            .getElementById("description")
            .value
            .trim();

    const amount =
        Number(
            document
                .getElementById("amount")
                .value
        );

    const type =
        document
            .getElementById("type")
            .value;

    const category =
        document
            .getElementById("category")
            .value;

    if (!description) {
        alert("Please enter a description");
        return;
    }

    if (amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date: new Date().toISOString()
    };

    transactions.push(transaction);

    saveTransactions();
    updateDashboard();
    renderTransactions();
    renderChart();
    clearForm();
}

// ========================================
// SAVE DATA
// ========================================

function saveTransactions() {

    localStorage.setItem(
        "expenseTransactions",
        JSON.stringify(transactions)
    );

}

// ========================================
// LOAD DATA
// ========================================

function loadTransactions() {

    const savedData =
        localStorage.getItem(
            "expenseTransactions"
        );

    transactions =
        savedData
            ? JSON.parse(savedData)
            : [];

    updateDashboard();
    renderTransactions();
    renderChart();

}

// ========================================
// CLEAR FORM
// ========================================

function clearForm() {

    document.getElementById(
        "description"
    ).value = "";

    document.getElementById(
        "amount"
    ).value = "";

    document.getElementById(
        "type"
    ).value = "expense";

    document.getElementById(
        "category"
    ).value = "Food";

}

// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    const now = new Date();

    let todayExpense = 0;
    let weeklyExpense = 0;
    let monthlyExpense = 0;
    let monthlyIncome = 0;

    transactions.forEach(transaction => {

        const transactionDate =
            new Date(transaction.date);

        const daysDifference =
            (now - transactionDate) /
            (1000 * 60 * 60 * 24);

        const sameDay =
            transactionDate.toDateString()
            === now.toDateString();

        const sameMonth =
            transactionDate.getMonth()
            === now.getMonth()
            &&
            transactionDate.getFullYear()
            === now.getFullYear();

        if (transaction.type === "expense") {

            if (sameDay) {
                todayExpense += transaction.amount;
            }

            if (daysDifference <= 7) {
                weeklyExpense += transaction.amount;
            }

            if (sameMonth) {
                monthlyExpense += transaction.amount;
            }

        }

        if (
            transaction.type === "income"
            &&
            sameMonth
        ) {
            monthlyIncome += transaction.amount;
        }

    });

    const netBalance =
        monthlyIncome -
        monthlyExpense;

    const remainingBudget =
        MONTHLY_BUDGET -
        monthlyExpense;

    const budgetUsedPercent =
        Math.min(
            100,
            Math.round(
                (monthlyExpense /
                    MONTHLY_BUDGET) * 100
            )
        );

    document.getElementById(
        "todaySpend"
    ).textContent =
        formatCurrency(todayExpense);

    document.getElementById(
        "weeklySpend"
    ).textContent =
        formatCurrency(weeklyExpense);

    document.getElementById(
        "monthlyExpense"
    ).textContent =
        formatCurrency(monthlyExpense);

    document.getElementById(
        "monthlyIncome"
    ).textContent =
        formatCurrency(monthlyIncome);

    document.getElementById(
        "netBalance"
    ).textContent =
        formatCurrency(netBalance);

    document.getElementById(
        "remainingBudget"
    ).textContent =
        formatCurrency(remainingBudget);

    const budgetElement =
        document.getElementById(
            "remainingBudget"
        );

    if (remainingBudget < 0) {

        budgetElement.style.color =
            "#ef4444";

    }
    else if (
        budgetUsedPercent >= 80
    ) {

        budgetElement.style.color =
            "#f59e0b";

    }
    else {

        budgetElement.style.color =
            "#22c55e";

    }

    const banner =
        document.getElementById(
            "budgetBanner"
        );

    const message =
        document.getElementById(
            "budgetMessage"
        );

    banner.classList.remove(
        "budget-normal",
        "budget-warning",
        "budget-danger"
    );

    if (remainingBudget < 0) {

        banner.classList.add(
            "budget-danger"
        );

        message.textContent =
            `🔴 Budget exceeded by ${formatCurrency(Math.abs(remainingBudget))}`;

    }
    else if (
        budgetUsedPercent >= 80
    ) {

        banner.classList.add(
            "budget-warning"
        );

        message.textContent =
            `⚠ You have used ${budgetUsedPercent}% of your budget`;

    }
    else {

        banner.classList.add(
            "budget-normal"
        );

        message.textContent =
            `✅ Budget Healthy • Remaining ${formatCurrency(remainingBudget)}`;

    }

    document.getElementById(
        "budgetPercent"
    ).textContent =
        budgetUsedPercent + "%";

    const progressCircle =
        document.querySelector(
            ".progress-circle"
        );

    const angle =
        budgetUsedPercent * 3.6;

    progressCircle.style.background =
        `conic-gradient(
            white ${angle}deg,
            rgba(255,255,255,.2) ${angle}deg
        )`;

}

// ========================================
// TRANSACTIONS
// ========================================

function renderTransactions() {

    const list =
        document.getElementById(
            "transactionList"
        );

    list.innerHTML = "";

    const sortedTransactions =
        [...transactions].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );

    sortedTransactions.forEach(
        transaction => {

            const item =
                document.createElement("li");

            const icon =
                getCategoryIcon(
                    transaction.category
                );

            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";

            const amountClass =
                transaction.type === "income"
                    ? "income"
                    : "expense";

            item.innerHTML = `
                <div class="transaction-info">

                    <span class="transaction-title">
                        ${icon}
                        ${transaction.description}
                    </span>

                    <span class="transaction-category">
                        ${transaction.category}
                        •
                        ${formatDate(transaction.date)}
                    </span>

                </div>

                <div style="display:flex;align-items:center;gap:10px;">

                    <div class="${amountClass}">
                        ${sign}${formatCurrency(transaction.amount)}
                    </div>

                    <button
                        class="edit-btn"
                        onclick="editTransaction(${transaction.id})">
                        ✏️
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">
                        🗑
                    </button>

                </div>
            `;

            list.appendChild(item);

        });

}

// ========================================
// DELETE
// ========================================

function editTransaction(id) {

    const transaction =
        transactions.find(
            t => t.id === id
        );

    if (!transaction) {
        return;
    }

    document.getElementById(
        "description"
    ).value =
        transaction.description;

    document.getElementById(
        "amount"
    ).value =
        transaction.amount;

    document.getElementById(
        "type"
    ).value =
        transaction.type;

    document.getElementById(
        "category"
    ).value =
        transaction.category;

    deleteTransactionWithoutPrompt(id);

}

function deleteTransactionWithoutPrompt(id) {

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );

    saveTransactions();
    updateDashboard();
    renderTransactions();
    renderChart();

}
function deleteTransaction(id) {

    const confirmed =
        confirm("Delete this transaction?");

    if (!confirmed) { return; }

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );

    saveTransactions();
    updateDashboard();
    renderTransactions();
    renderChart();

}

// ========================================
// CHART
// ========================================

function renderChart() {

    const categoryTotals = {};

    transactions.forEach(transaction => {

        if (transaction.type !== "expense") {
            return;
        }

        if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = 0;
        }

        categoryTotals[transaction.category] +=
            transaction.amount;

    });

    const labels =
        Object.keys(categoryTotals);

    const values =
        Object.values(categoryTotals);

    const chartCanvas =
        document.getElementById(
            "expenseChart"
        );

    if (!chartCanvas) {
        return;
    }

    const ctx =
        chartCanvas.getContext("2d");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart =
        new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    backgroundColor: [

                        "#6366f1",
                        "#f97316",
                        "#22c55e",
                        "#ef4444",
                        "#06b6d4",
                        "#eab308",
                        "#8b5cf6"

                    ]

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        });

}

// ========================================
// DATE FORMATTER
// ========================================

function formatDate(dateString) {

    const date = new Date(dateString);

    const today = new Date();

    if (
        date.toDateString() ===
        today.toDateString()
    ) {
        return "Today";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

// ========================================
// ICONS
// ========================================

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",
        Transport: "🚗",
        Shopping: "🛒",
        Utilities: "💡",
        Entertainment: "🎬",
        Health: "❤️",
        Other: "📦"

    };

    return icons[category] || "📦";

}

// ========================================
// FORMAT
// ========================================

function formatCurrency(value) {

    return (
        "₹" +
        value.toLocaleString("en-IN")
    );

}

// ========================================
// THEME
// ========================================

function toggleTheme() {

    document.body.classList.toggle("dark");

    const dark =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(
        "theme",
        dark
    );

}

(function loadTheme() {

    const dark =
        localStorage.getItem("theme");

    if (dark === "true") {
        document.body.classList.add(
            "dark"
        );
    }

})();

// ========================================
// EXPORT BACKUP
// ========================================

function exportData() {

    const data =
        JSON.stringify(
            transactions,
            null,
            2
        );

    const blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        "expense-backup.json";

    link.click();

    URL.revokeObjectURL(url);

}

function importData(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function (e) {

        try {

            const importedData =
                JSON.parse(
                    e.target.result
                );

            if (
                !Array.isArray(
                    importedData
                )
            ) {

                alert(
                    "Invalid backup file"
                );

                return;

            }

            transactions =
                importedData;

            saveTransactions();

            updateDashboard();

            renderTransactions();

            alert(
                "Backup restored successfully"
            );

        }
        catch {

            alert(
                "Unable to import file"
            );

        }

    };

    reader.readAsText(file);

}