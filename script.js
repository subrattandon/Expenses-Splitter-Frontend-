// State management
let members = [];
let expenses = [];
let selectedDate = new Date();
let expenseDates = new Set();

// Background images
const backgrounds = [
    'https://unsplash.com/photos/100-indian-rupee-banknote-ILpCscZCeR8',
    'https://unsplash.com/photos/round-gold-colored-rupee-coins-and-banknotes-KzUiI7ENbws',
    'https://unsplash.com/photos/a-black-sports-car-parked-in-front-of-a-building-D5eJFNUwwcA',
];
let currentBg = 0;

function changeBackground() {
    document.body.style.backgroundImage = `url(${backgrounds[currentBg]})`;
    currentBg = (currentBg + 1) % backgrounds.length;
}

setInterval(changeBackground, 10000);
changeBackground();

// Dark mode toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = darkModeToggle.querySelector('i');
    icon.classList.toggle('bi-moon-fill');
    icon.classList.toggle('bi-sun-fill');
});

// Member management
function addMember() {
    const nameInput = document.getElementById('memberName');
    const phoneInput = document.getElementById('memberPhone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (name && phone) {
        members.push({ name, phone });
        updateMembersList();
        updatePayerSelect();
        nameInput.value = '';
        phoneInput.value = '';
        showNotification('Member added successfully!');
    }
}

function removeMember(index) {
    members.splice(index, 1);
    updateMembersList();
    updatePayerSelect();
    showNotification('Member removed successfully!');
}

function sendSMS(phone) {
    showNotification(`SMS reminder sent to ${phone}`);
}

function updateMembersList() {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = members.map((member, index) => `
        <li class="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>${member.name}</span>
            <div class="flex gap-2">
                <button onclick="sendSMS('${member.phone}')" class="sms-button">
                    <i class="bi bi-envelope"></i> SMS
                </button>
                <button onclick="removeMember(${index})" class="btn-delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

function updatePayerSelect() {
    const payerSelect = document.getElementById('payer');
    payerSelect.innerHTML = '<option value="">Select payer</option>' +
        members.map(member => `<option value="${member.name}">${member.name}</option>`).join('');
}

// Expense management
document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const payer = document.getElementById('payer').value;

    if (description && amount && payer) {
        const expense = { description, amount, payer, date: selectedDate };
        expenses.push(expense);
        expenseDates.add(selectedDate.toDateString());
        updateExpenseList();
        updateSplitSummary();
        renderCalendar();
        e.target.reset();
        showNotification('Expense added successfully!');
    }
});

function clearExpenses() {
    expenses = [];
    expenseDates.clear();
    updateExpenseList();
    updateSplitSummary();
    renderCalendar();
    showNotification('All expenses cleared!');
}

function updateExpenseList() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = expenses.map((expense) => `
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
                <strong>${expense.description}</strong><br>
                <small>Paid by: ${expense.payer}</small>
            </div>
            <div class="text-right">
                <div>₹${expense.amount.toFixed(2)}</div>
                <small>${new Date(expense.date).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

function updateSplitSummary() {
    const splitSummary = document.getElementById('splitSummary');
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const perPersonShare = totalExpense / members.length;

    let summary = `<div class="font-semibold">Total Expense: ₹${totalExpense.toFixed(2)}</div>`;
    summary += `<div class="mt-2">Per person share: ₹${perPersonShare.toFixed(2)}</div>`;

    const balances = {};
    members.forEach(member => {
        balances[member.name] = 0;
    });

    expenses.forEach(expense => {
        balances[expense.payer] += expense.amount;
    });

    Object.keys(balances).forEach(member => {
        balances[member] -= perPersonShare;
    });

    summary += '<div class="mt-4"><strong>Settlement:</strong></div>';
    Object.entries(balances).forEach(([member, balance]) => {
        const formattedBalance = balance.toFixed(2);
        const status = balance > 0 ? 'gets back' : 'owes';
        summary += `<div>${member} ${status} ₹${Math.abs(formattedBalance)}</div>`;
    });

    splitSummary.innerHTML = summary;
}

// Calendar functionality
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const date = new Date(selectedDate);
    const month = date.getMonth();
    const year = date.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let calendarHTML = `
        <div class="flex justify-between items-center mb-4">
            <button onclick="previousMonth()" class="p-2 hover:bg-gray-200 rounded">
                <i class="bi bi-chevron-left"></i>
            </button>
            <div class="font-bold">
                ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}
            </div>
            <button onclick="nextMonth()" class="p-2 hover:bg-gray-200 rounded">
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center">
            ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => 
                `<div class="calendar-day font-bold">${day}</div>`
            ).join('')}
        </div>
        <div class="grid grid-cols-7 gap-1 text-center">
    `;

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const isSelected = currentDate.toDateString() === selectedDate.toDateString();
        const hasExpense = expenseDates.has(currentDate.toDateString());
        
        calendarHTML += `
            <div class="calendar-day ${isSelected ? 'selected-date' : ''} ${hasExpense ? 'expense-event' : ''}"
                 onclick="selectDate(${year}, ${month}, ${day})">
                ${day}
            </div>
        `;
    }

    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
}

function previousMonth() {
    selectedDate.setMonth(selectedDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    selectedDate.setMonth(selectedDate.getMonth() + 1);
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    renderCalendar();
    showNotification(`Selected date: ${selectedDate.toLocaleDateString()}`);
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification bg-green-500 text-white px-4 py-2 rounded shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Download summary
function downloadSummary() {
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const perPersonShare = totalExpense / members.length;

    let summary = `
        Expense Summary
        ==============
        
        Date: ${new Date().toLocaleDateString()}
        
        Members:
        ${members.map(member => `${member.name} (${member.phone})`).join('\n')}
        
        Expenses:
        ${expenses.map(exp => 
            `${exp.description}: ₹${exp.amount} (Paid by ${exp.payer}) - ${new Date(exp.date).toLocaleDateString()}`
        ).join('\n')}
        
        Total: ₹${totalExpense.toFixed(2)}
        Per Person Share: ₹${perPersonShare.toFixed(2)}
        
        Settlement Details:
    `;

    const balances = {};
    members.forEach(member => {
        balances[member.name] = 0;
    });

    expenses.forEach(expense => {
        balances[expense.payer] += expense.amount;
    });

    Object.keys(balances).forEach(member => {
        balances[member] -= perPersonShare;
    });

    Object.entries(balances).forEach(([member, balance]) => {
        summary += `${member} ${balance > 0 ? 'gets back' : 'owes'} ₹${Math.abs(balance.toFixed(2))}\n`;
    });

    const blob = new Blob([summary], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'expense_summary.txt';
    link.click();
    showNotification('Summary downloaded!');
}

// Initial render
renderCalendar();
