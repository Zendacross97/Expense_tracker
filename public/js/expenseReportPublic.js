const token = localStorage.getItem('token');

window.addEventListener("DOMContentLoaded", () => {
    const yearSelector = document.getElementById('yearSelector');
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        yearSelector.appendChild(option);
    }
    // Set current year as selected
    yearSelector.value = currentYear;

    const monthSelector = document.getElementById('monthSelector');
    const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-based
    // Set current month as selected
    monthSelector.value = currentMonth;

    getExpenseReport();
});

function getExpenseReport() {
    const yearSelector = document.getElementById('yearSelector');
    const monthSelector = document.getElementById('monthSelector');
    const selectedYear = yearSelector.value;
    const selectedMonth = monthSelector.value;
    // const p = document.querySelector('.monthly-report-message');
    // p.innerHTML = ''; // Clear previous messages
    const monthlyReport = document.querySelector('.monthly-report');
    monthlyReport.innerHTML = ''; // Clear previous data
    const dailyReport = document.querySelector('.daily-report');
    dailyReport.innerHTML = ''; // Clear previous data
    getMonthlyExpenseReportByYear(selectedYear);
    getDailyExpenseReportByMonth(selectedYear, selectedMonth);
}

function getMonthlyExpenseReportByYear(selectedYear) {
    axios.get(`http://localhost:3000/expense/monthlyReport/${selectedYear}`, { headers: { 'Authorization': token } })
        .then((res) => {
            populateMonthlyExpenseReport(res.data);
        })
        .catch((err) => {
            const p = document.querySelector('.monthly-report-message');
            p.innerHTML = err.response.data.error ? err.response.data.error : 'An error occured';
            p.style.color = 'red';
        });
}

function getDailyExpenseReportByMonth(selectedYear, selectedMonth) {
    axios.get(`http://localhost:3000/expense/dailyReport/${selectedYear}/${selectedMonth}`, { headers: { 'Authorization': token } })
        .then((res) => {
            populateDailyExpenseReport(res.data);
        })
        .catch((err) => {
            const p = document.querySelector('.daily-report-message');
            p.innerHTML = err.response.data.error ? err.response.data.error : 'An error occured';
            p.style.color = 'red';
        });
}

function populateMonthlyExpenseReport(data) {
    const p = document.querySelector('.monthly-report-message');
    p.innerHTML = ''; // Clear previous messages
    const monthlyReport = document.querySelector('.monthly-report');
    monthlyReport.innerHTML = ''; // Clear previous data
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    for (let i=0; i<data.length; i++) {
        const tr = document.createElement('tr'); // Create a new row for each entry
        const tdMonth = document.createElement('td');// Create a new cell for the month
        tdMonth.textContent = `${monthNames[+data[i].month-1]}`// Set the text content of the month cell
        const tdExpense = document.createElement('td');// Create a new cell for the total expense
        tdExpense.textContent = data[i].totalAmount;// Set the text content of the expense cell
        tr.appendChild(tdMonth);
        tr.appendChild(tdExpense);
        monthlyReport.appendChild(tr);
    }
}

function populateDailyExpenseReport(data) {
    const p = document.querySelector('.daily-report-message');
    p.innerHTML = ''; // Clear previous messages
    const dailyReport = document.querySelector('.daily-report');
    dailyReport.innerHTML = ''; // Clear previous data
    for (let i=0; i<data.length; i++) {
        const tr = document.createElement('tr');// Create a new row for each entry
        const tdDate = document.createElement('td');// Create a new cell for the date
        tdDate.textContent = data[i].date;// Set the text content of the date cell
        const tdDescription = document.createElement('td');// Create a new cell for the description
        tdDescription.textContent = data[i].description;// Set the text content of the description cell
        const tdCategory = document.createElement('td');// Create a new cell for the category
        tdCategory.textContent = data[i].category;// Set the text content of the category cell
        const tdAmount = document.createElement('td');// Create a new cell for the amount
        tdAmount.textContent = data[i].totalAmount;// Set the text content of the amount cell
        tr.appendChild(tdDate);
        tr.appendChild(tdDescription);
        tr.appendChild(tdCategory);
        tr.appendChild(tdAmount);
        dailyReport.appendChild(tr);
    }
}

// Event listeners for year and month selection
document.getElementById('yearSelector').addEventListener('change', getExpenseReport);
document.getElementById('monthSelector').addEventListener('change', getExpenseReport);