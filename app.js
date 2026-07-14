let selectedMonth = new Date();
let transactions = [];
let monthlyIncomes = {};
let expenseChart = null;
let activeFilter = "all";
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
    loadMonthlyIncomes();
    initializeMonthPicker();
    loadTransactions();

    safeClick("addBtn", addTransaction);
    safeClick("themeBtn", toggleTheme);

    safeClick("exportBtn", exportData);
    safeChange("importFile", importData);

    safeClick("saveIncomeBtn", saveMonthlyIncome);
    safeChange("monthPicker", changeSelectedMonth);

    safeClick("prevMonthBtn", goToPreviousMonth);
    safeClick("nextMonthBtn", goToNextMonth);

    safeClick("incomeFab", openIncomeModal);
    safeClick("closeIncomeModal", closeIncomeModal);

    safeClick("transactionFab", openTransactionModal);
    safeClick("closeTransactionModal", closeTransactionModal);

    setupModalClose("incomeModal", closeIncomeModal);
    setupModalClose("transactionModal", closeTransactionModal);

    setupSearch();
    setupFilters();

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeIncomeModal();
            closeTransactionModal();
        }
    });
});

function safeClick(id, fn) {
    const element = document.getElementById(id);

    if (element) {
        element.addEventListener("click", fn);
    }
}

function safeChange(id, fn) {
    const element = document.getElementById(id);

    if (element) {
        element.addEventListener("change", fn);
    }
}

function setupModalClose(modalId, closeFunction) {
    const modal = document.getElementById(modalId);

    if (!modal) {
        return;
    }

    modal.addEventListener("click", event => {
        if (event.target.id === modalId) {
            closeFunction();
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", event => {
        searchQuery = event.target.value.trim().toLowerCase();
        renderTransactions();
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-chip");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            activeFilter = button.dataset.filter || "all";

            renderTransactions();
        });
    });
}

function openIncomeModal() {
    const modal = document.getElementById("incomeModal");

    if (!modal) {
        return;
    }

    modal.classList.add("show");

    updateIncomeInput();
}

function closeIncomeModal() {
    const modal = document.getElementById("incomeModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
}

function openTransactionModal() {
    const modal = document.getElementById("transactionModal");

    if (!modal) {
        return;
    }

    modal.classList.add("show");

    const descriptionInput = document.getElementById("description");

    if (descriptionInput) {
        setTimeout(() => {
            descriptionInput.focus();
        }, 150);
    }
}

function closeTransactionModal() {
    const modal = document.getElementById("transactionModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
}

function addTransaction() {
    const description = document
        .getElementById("description")
        .value
        .trim();

    const amount = Number(
        document.getElementById("amount").value
    );

    const type = document
        .getElementById("type")
        .value;

    const category = document
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
    renderCalendar();
    renderChart();
    clearForm();
    closeTransactionModal();
}

function saveTransactions() {
    localStorage.setItem(
        "expenseTransactions",
        JSON.stringify(transactions)
    );
}

function loadTransactions() {
    const savedData = localStorage.getItem("expenseTransactions");

    transactions = savedData
        ? JSON.parse(savedData)
        : [];

    updateDashboard();
    renderTransactions();
    renderCalendar();
    renderChart();
}

function clearForm() {
    const description = document.getElementById("description");
    const amount = document.getElementById("amount");
    const type = document.getElementById("type");
    const category = document.getElementById("category");

    if (description) {
        description.value = "";
    }

    if (amount) {
        amount.value = "";
    }

    if (type) {
        type.value = "expense";
    }

    if (category) {
        category.value = "Food";
    }
}

function getMonthKey(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
}

function initializeMonthPicker() {
    const monthPicker = document.getElementById("monthPicker");

    if (!monthPicker) {
        return;
    }

    monthPicker.value = getMonthKey(selectedMonth);

    updateIncomeInput();
}

function loadMonthlyIncomes() {
    const saved = localStorage.getItem("monthlyIncomes");

    monthlyIncomes = saved
        ? JSON.parse(saved)
        : {};
}

function saveMonthlyIncomes() {
    localStorage.setItem(
        "monthlyIncomes",
        JSON.stringify(monthlyIncomes)
    );
}

function updateIncomeInput() {
    const input = document.getElementById("monthlyIncomeInput");

    if (!input) {
        return;
    }

    const key = getMonthKey(selectedMonth);

    input.value = monthlyIncomes[key] || "";
}

function saveMonthlyIncome() {
    const key = getMonthKey(selectedMonth);

    const income = Number(
        document.getElementById("monthlyIncomeInput").value
    );

    if (income < 0) {
        alert("Please enter a valid income");
        return;
    }

    monthlyIncomes[key] = income;

    saveMonthlyIncomes();
    updateDashboard();
    renderCalendar();
    renderChart();
    closeIncomeModal();
}

function changeSelectedMonth() {
    const value = document.getElementById("monthPicker").value;

    if (!value) {
        return;
    }

    selectedMonth = new Date(value + "-01");

    updateIncomeInput();
    updateDashboard();
    renderCalendar();
    renderChart();
}

function goToPreviousMonth() {
    selectedMonth.setMonth(
        selectedMonth.getMonth() - 1
    );

    const monthPicker = document.getElementById("monthPicker");

    if (monthPicker) {
        monthPicker.value = getMonthKey(selectedMonth);
    }

    updateIncomeInput();
    updateDashboard();
    renderCalendar();
    renderChart();
}

function goToNextMonth() {
    selectedMonth.setMonth(
        selectedMonth.getMonth() + 1
    );

    const monthPicker = document.getElementById("monthPicker");

    if (monthPicker) {
        monthPicker.value = getMonthKey(selectedMonth);
    }

    updateIncomeInput();
    updateDashboard();
    renderCalendar();
    renderChart();
}

function updateDashboard() {
    const now = new Date();

    const selectedYear = selectedMonth.getFullYear();
    const selectedMonthNumber = selectedMonth.getMonth();
    const selectedMonthKey = getMonthKey(selectedMonth);

    const selectedMonthIncome =
        monthlyIncomes[selectedMonthKey] || 0;

    let todayExpense = 0;
    let weeklyExpense = 0;
    let monthlyExpense = 0;
    let yearlyExpense = 0;

    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);

        const daysDifference =
            (now - transactionDate) /
            (1000 * 60 * 60 * 24);

        const sameDay =
            transactionDate.toDateString() ===
            now.toDateString();

        const sameSelectedMonth =
            transactionDate.getMonth() === selectedMonthNumber &&
            transactionDate.getFullYear() === selectedYear;

        const sameSelectedYear =
            transactionDate.getFullYear() === selectedYear;

        if (transaction.type === "expense") {
            if (sameDay) {
                todayExpense += transaction.amount;
            }

            if (daysDifference <= 7) {
                weeklyExpense += transaction.amount;
            }

            if (sameSelectedMonth) {
                monthlyExpense += transaction.amount;
            }

            if (sameSelectedYear) {
                yearlyExpense += transaction.amount;
            }
        }
    });

    let yearlyIncome = 0;

    Object.keys(monthlyIncomes).forEach(key => {
        const year = Number(key.split("-")[0]);

        if (year === selectedYear) {
            yearlyIncome += Number(monthlyIncomes[key]);
        }
    });

    const netBalance =
        selectedMonthIncome - monthlyExpense;

    const spentPercent =
        selectedMonthIncome > 0
            ? Math.min(
                100,
                Math.round(
                    (monthlyExpense / selectedMonthIncome) * 100
                )
            )
            : 0;

    setText("todaySpend", formatCurrency(todayExpense));
    setText("weeklySpend", formatCurrency(weeklyExpense));
    setText("monthlyExpense", formatCurrency(monthlyExpense));
    setText("monthlyIncome", formatCurrency(selectedMonthIncome));
    setText("incomeSummary", `Income: ${formatCurrency(selectedMonthIncome)}`);
    setText("netBalance", formatCurrency(netBalance));
    setText("yearlyExpense", formatCurrency(yearlyExpense));
    setText("yearlyIncome", formatCurrency(yearlyIncome));
    setText("spentPercent", spentPercent + "%");

    const balanceElement = document.getElementById("netBalance");

    if (balanceElement) {
        balanceElement.style.color =
            netBalance < 0 ? "#ef4444" : "#22c55e";
    }

    const progressCircle =
        document.querySelector(".progress-circle");

    if (progressCircle) {
        const angle = spentPercent * 3.6;

        progressCircle.style.background =
            `conic-gradient(
                white ${angle}deg,
                rgba(255,255,255,.2) ${angle}deg
            )`;
    }
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function getFilteredTransactions() {
    return transactions.filter(transaction => {
        const matchesSearch =
            transaction.description.toLowerCase().includes(searchQuery) ||
            transaction.category.toLowerCase().includes(searchQuery) ||
            transaction.type.toLowerCase().includes(searchQuery) ||
            formatDate(transaction.date).toLowerCase().includes(searchQuery);

        const matchesFilter =
            activeFilter === "all" ||
            transaction.type === activeFilter ||
            transaction.category === activeFilter;

        return matchesSearch && matchesFilter;
    });
}

function renderTransactions() {
    const list = document.getElementById("transactionList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    const filteredTransactions =
        getFilteredTransactions()
            .sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

    if (filteredTransactions.length === 0) {
        list.innerHTML = `
            <li class="no-transactions">
                No transactions found.
            </li>
        `;

        return;
    }

    filteredTransactions.forEach(transaction => {
        const item = document.createElement("li");

        const icon = getCategoryIcon(transaction.category);

        const sign =
            transaction.type === "income" ? "+" : "-";

        const amountClass =
            transaction.type === "income" ? "income" : "expense";

        item.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-title">
                    ${icon} ${transaction.description}
                </span>

                <span class="transaction-category">
                    ${transaction.category} • ${formatDate(transaction.date)}
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

function editTransaction(id) {
    const transaction =
        transactions.find(item => item.id === id);

    if (!transaction) {
        return;
    }

    document.getElementById("description").value =
        transaction.description;

    document.getElementById("amount").value =
        transaction.amount;

    document.getElementById("type").value =
        transaction.type;

    document.getElementById("category").value =
        transaction.category;

    deleteTransactionWithoutPrompt(id);

    openTransactionModal();
}

function deleteTransactionWithoutPrompt(id) {
    transactions =
        transactions.filter(transaction => transaction.id !== id);

    saveTransactions();
    updateDashboard();
    renderTransactions();
    renderCalendar();
    renderChart();
}

function deleteTransaction(id) {
    const confirmed = confirm("Delete this transaction?");

    if (!confirmed) {
        return;
    }

    transactions =
        transactions.filter(transaction => transaction.id !== id);

    saveTransactions();
    updateDashboard();
    renderTransactions();
    renderCalendar();
    renderChart();
}

function renderCalendar() {
    const calendarGrid = document.getElementById("calendarGrid");
    const calendarTitle = document.getElementById("calendarTitle");

    if (!calendarGrid || !calendarTitle) {
        return;
    }

    calendarGrid.innerHTML = "";

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    calendarTitle.textContent =
        selectedMonth.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");

        emptyCell.className = "calendar-day empty";

        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);

        let dailyExpense = 0;

        transactions.forEach(transaction => {
            const transactionDate =
                new Date(transaction.date);

            if (
                transaction.type === "expense" &&
                transactionDate.getFullYear() === year &&
                transactionDate.getMonth() === month &&
                transactionDate.getDate() === day
            ) {
                dailyExpense += transaction.amount;
            }
        });

        const dayCell = document.createElement("div");

        dayCell.className = "calendar-day";

        if (
            date.toDateString() ===
            new Date().toDateString()
        ) {
            dayCell.classList.add("today");
        }

        dayCell.innerHTML = `
            <div class="calendar-date">
                ${day}
            </div>

            <div class="calendar-amount">
                ${dailyExpense > 0 ? formatShortCurrency(dailyExpense) : ""}
            </div>
        `;

        dayCell.addEventListener("click", () => {
            showDayTransactions(year, month, day);

            document
                .querySelectorAll(".calendar-day")
                .forEach(cell => {
                    cell.classList.remove("selected");
                });

            dayCell.classList.add("selected");
        });

        calendarGrid.appendChild(dayCell);
    }

    const today = new Date();

    if (
        today.getFullYear() === year &&
        today.getMonth() === month
    ) {
        showDayTransactions(
            year,
            month,
            today.getDate()
        );
    } else {
        setText("selectedDayTitle", "Select a day");

        const selectedList =
            document.getElementById("selectedDayTransactions");

        if (selectedList) {
            selectedList.innerHTML = "";
        }
    }
}

function showDayTransactions(year, month, day) {
    const title = document.getElementById("selectedDayTitle");
    const list = document.getElementById("selectedDayTransactions");

    if (!title || !list) {
        return;
    }

    const selectedDate = new Date(year, month, day);

    title.textContent =
        selectedDate.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    list.innerHTML = "";

    const dayTransactions =
        transactions.filter(transaction => {
            const transactionDate =
                new Date(transaction.date);

            return (
                transactionDate.getFullYear() === year &&
                transactionDate.getMonth() === month &&
                transactionDate.getDate() === day
            );
        });

    if (dayTransactions.length === 0) {
        list.innerHTML = `
            <li class="no-transactions">
                No transactions for this day.
            </li>
        `;

        return;
    }

    dayTransactions.forEach(transaction => {
        const item = document.createElement("li");

        const icon = getCategoryIcon(transaction.category);

        const sign =
            transaction.type === "income" ? "+" : "-";

        const amountClass =
            transaction.type === "income" ? "income" : "expense";

        item.innerHTML = `
            <div class="day-transaction-info">
                <span class="day-transaction-title">
                    ${icon} ${transaction.description}
                </span>

                <span class="day-transaction-category">
                    ${transaction.category} • ${transaction.type}
                </span>
            </div>

            <div class="${amountClass}">
                ${sign}${formatCurrency(transaction.amount)}
            </div>
        `;

        list.appendChild(item);
    });
}

function renderChart() {
    const chartCanvas = document.getElementById("expenseChart");

    if (!chartCanvas || typeof Chart === "undefined") {
        return;
    }

    const categoryTotals = {};

    transactions.forEach(transaction => {
        if (transaction.type !== "expense") {
            return;
        }

        if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = 0;
        }

        categoryTotals[transaction.category] += transaction.amount;
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    const context = chartCanvas.getContext("2d");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(context, {
        type: "doughnut",

        data: {
            labels,

            datasets: [
                {
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
                }
            ]
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

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
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

function formatCurrency(value) {
    return "₹" + Number(value).toLocaleString("en-IN");
}

function formatShortCurrency(value) {
    const amount = Number(value);

    if (amount >= 100000) {
        return "₹" + (amount / 100000).toFixed(1) + "L";
    }

    if (amount >= 1000) {
        return "₹" + (amount / 1000).toFixed(1) + "K";
    }

    return "₹" + amount.toLocaleString("en-IN");
}

function toggleTheme() {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
    );
}

(function loadTheme() {
    const dark = localStorage.getItem("theme");

    if (dark === "true") {
        document.body.classList.add("dark");
    }
})();

function exportData() {
    const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        transactions,
        monthlyIncomes
    };

    const data =
        JSON.stringify(
            backup,
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
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = "expense-tracker-backup.json";

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

    reader.onload = function (event) {
        try {
            const importedData =
                JSON.parse(event.target.result);

            if (Array.isArray(importedData)) {
                transactions = importedData;
            } else if (
                importedData &&
                Array.isArray(importedData.transactions)
            ) {
                transactions = importedData.transactions;
                monthlyIncomes = importedData.monthlyIncomes || {};
            } else {
                alert("Invalid backup file");
                return;
            }

            saveTransactions();
            saveMonthlyIncomes();

            updateDashboard();
            renderTransactions();
            renderCalendar();
            renderChart();

            alert("Backup restored successfully");
        } catch {
            alert("Unable to import file");
        }
    };

    reader.readAsText(file);
}