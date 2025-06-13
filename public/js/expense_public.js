const token = localStorage.getItem('token');
let page = 1, lastPage = 1, limit = localStorage.getItem(`expensePerPage`) || 5;

const expensePerPage = document.querySelector('#expense_per_page');
expensePerPage.addEventListener('change', (event) => {
    event.preventDefault();
    localStorage.setItem(`expensePerPage`, event.target.value);
    limit = event.target.value;
    getExpense(page, limit);
})

function add(event){
    event.preventDefault();
    const amount = event.target.amount.value;
    const description = event.target.description.value;
    const category = event.target.category.value;
    const note = event.target.note.value;
    let expenseDetails = { amount, description, category, note };
    axios.post('/expense/addExpense', expenseDetails, { headers: { 'Authorization': token } })
    .then((res) => {
        const p = document.querySelector('.expense_message');
        p.innerHTML = '';
        getExpense(lastPage+1, limit); // Refresh the expense list
    })
    .catch((err) => {
        const p = document.querySelector('.expense_message');
        p.innerHTML = err.response.data.error ? err.response.data.error : 'An error occured';
        p.style.color = 'red';
    })
    event.target.amount.value = '';
    event.target.description.value = '';
    event.target.category.value = '';
    event.target.note.value = '';
}

window.addEventListener("DOMContentLoaded", () => {
    expensePerPage.value = limit; // Set the initial value of the dropdown
    checkMembership();
    getExpense(page, limit);
});

function checkMembership(){
    axios.get('/expense/payment_status', { headers: { 'Authorization': token } })   
    .then((res) => {
        const header = document.querySelector('.header');
        const h = header.querySelector('#premium');
        if (res.data.orderStatus === 'SUCCESS') {
            h.innerHTML = 'You are a premium user <button id="premiumBtn">Show leaderboard</button> <button id="reportBtn">Show Report</button>';
            const premiumBtn = header.querySelector('#premiumBtn');
            premiumBtn.onclick = () => {
                axios.get('/expense/leaderboard', { headers: { 'Authorization': token } })
                .then((res) => {
                    showLeaderboard(res.data);
                })
                .catch((err) => {
                    const h = document.createElement('h2');
                    h.id = 'leaderboard';
                    h.innerHTML = 'Leaderboard:';
                    const p = document.createElement('p');
                    p.innerHTML = err.response.data.error ? err.response.data.error : 'An error occurred';
                    p.style.color = 'red';
                    document.body.appendChild(h);
                    document.body.appendChild(p);
                })
            }
            const reportBtn = header.querySelector('#reportBtn');
            reportBtn.onclick = () => {
                window.location.href = `/expense/report`;
            }
        }
    })
}

function getExpense(page, limit) {
    const ul = document.querySelector(`ul`);
    ul.innerHTML = ''; // Clear previous expenses
    axios.get(`/expense/getExpense?page=${page}&limit=${+limit}`, { headers: { 'Authorization': token } })
    .then((res) => {
        for (let i = 0; i < res.data.expense.length; i++) {
            showExpense(res.data.expense[i]);
        }
        showPageination(res.data);
    })
    .catch((err) => {
        if (page > 1) {
            const oldPagination = document.querySelector('.pagination');
             if (oldPagination) document.body.removeChild(oldPagination);
             page--; // Decrement page if an error occurs
            getExpense(page, limit); // Fetch the previous page
        }
        else {
            const p = document.querySelector('.expense_message');
            p.innerHTML = err.response.data.error ? err.response.data.error : err.message;
            p.style.color = 'red';
        }
    })
}

function showExpense(data){
    const ul=document.querySelector(`ul`);
    const li=document.createElement(`li`);
    li.id = `li_${data.id}`;
    li.innerHTML = `${data.amount} - ${data.description} - ${data.category} - ${(data.note || 'no comments')} <button id="delete_${data.id}">Delete Expense</button>`;
    ul.appendChild(li);
    const Delete = li.querySelector(`#delete_${data.id}`);
    Delete.onclick = () => {
        deleteExpense(data.id);
    }
}

function showPageination({ totalPages, currentPage, nextPage, previousPage }) {
    // Remove old pagination if it exists
    const oldPagination = document.querySelector('.pagination');
    if (oldPagination) document.body.removeChild(oldPagination);
    // Create new pagination
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    document.body.appendChild(pagination);
    if (previousPage) {
        const previousBtn = document.createElement('button');
        previousBtn.id = 'previousBtn';
        previousBtn.innerHTML = `${previousPage}`;
        previousBtn.onclick = () => {
            pagination.innerHTML = ''; // Clear previous pagination
            getExpense(previousPage, limit); // Fetch the previous page
        }
        pagination.appendChild(previousBtn);
    }
    const currentBtn = document.createElement('button');
    currentBtn.id = 'currentBtn';
    page= currentPage; // Update global page variable
    lastPage = totalPages; // Update lastPage variable
    currentBtn.innerHTML = `${page}`;
    currentBtn.onclick = () => {
        pagination.innerHTML = ''; // Clear previous pagination
        getExpense(page, limit);
    }
    pagination.appendChild(currentBtn);
    if (nextPage) {
        const nextBtn = document.createElement('button');
        nextBtn.id = 'nextBtn';
        nextBtn.innerHTML = `${nextPage}`;
        nextBtn.onclick = () => {
            pagination.innerHTML = ''; // Clear previous pagination
            getExpense(nextPage, limit); // Fetch the next page
        }
        pagination.appendChild(nextBtn);
    }
    if (totalPages !== currentPage && totalPages !== nextPage) {
        const lastBtn = document.createElement('button');
        lastBtn.id = 'lastBtn';
        lastBtn.innerHTML = `${totalPages}`;
        lastBtn.onclick = () => {
            pagination.innerHTML = ''; // Clear previous pagination
            getExpense(totalPages, limit);
        }
        pagination.appendChild(lastBtn);
    }
}

function deleteExpense(expenseId){
    axios.delete(`/expense/deleteExpense/${expenseId}`, { headers: { 'Authorization': token } })
    .then(res => {
        const p = document.querySelector('.expense_message');
        const ul = document.querySelector(`ul`);
        const li = ul.querySelector(`#li_${expenseId}`);
        p.innerHTML = res.data.message;
        const Delete = li.querySelector(`#delete_${expenseId}`);
        ul.removeChild(Delete.parentElement);
        getExpense(page, limit);
    })
    .catch(err => {
        const p = document.querySelector('.expense_message');
        p.innerHTML = err.response.data.error ? err.response.data.error : 'An error occured';
    });
}

function showLeaderboard(data){
    // Remove old leaderboard header if it exists
    const oldHeader = document.querySelector('#leaderboard');
    if (oldHeader) document.body.removeChild(oldHeader);

    // Remove old leaderboard list if it exists
    const oldList = document.querySelector('.leaderboard');
    if (oldList) document.body.removeChild(oldList);

    const h = document.createElement('h2');
    h.id = 'leaderboard';
    h.innerHTML = 'Leaderboard:';
    const ul = document.createElement('ul');
    ul.className = 'leaderboard';
    for (let i = 0; i < data.length; i++) {
        const li = document.createElement('li');
        li.innerHTML = `Name: ${data[i].name} - Total Expense: ${data[i].totalExpense}`;
        ul.appendChild(li);
    }
    document.body.appendChild(h);
    document.body.appendChild(ul);
}

const header = document.querySelector('.expense_header');
const downloadBtn = header.querySelector('#downloadBtn');
downloadBtn.onclick = () => {
    axios.get('/expense/downloadExpenses', { headers: { 'Authorization': token } })
    .then((res) => {
        var a = document.createElement("a");
        a.href = res.data.fileURL;
        a.download = 'myexpenses.csv';
        a.click();
        showDownloadedfiles(res.data.downloadDetails);
    })
    .catch((err) => {
        const p = document.querySelector('.expense_message');
        p.innerHTML = err.response.data.error ? err.response.data.error : 'An error occured';
        p.style.color = 'red';
    });
}

function showDownloadedfiles(data) {
    // Remove old downloaded files list if it exists
    const oldHeader = document.querySelector('.downloaded_files_header');
    if (oldHeader) document.body.removeChild(oldHeader);
    const oldFiles = document.querySelector('.downloaded_files');
    if (oldFiles) document.body.removeChild(oldFiles);
    // Create new downloaded files list
    const h = document.createElement('h2');
    h.className = 'downloaded_files_header';
    h.innerHTML = 'Downloaded Files:';
    document.body.appendChild(h);
    // Create a new unordered list for downloaded files
    const ul = document.createElement('ul');
    ul.className = 'downloaded_files';
    for (let i = 0; i < data.length; i++) {
        const li = document.createElement('li');
        li.innerHTML = `Date: ${data[i].Date} - File URL: <a href="${data[i].fileUrl}" download>${data[i].fileUrl}</a>`;
        ul.appendChild(li);
    }
    document.body.appendChild(ul);

}