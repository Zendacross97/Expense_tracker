const token = localStorage.getItem('token');
let page = 1, lastPage = 1, nextPage = 1
let limit = parseInt(localStorage.getItem('expensePerPage')) || 5;

const expensePerPage = document.querySelector('#expense_per_page');

expensePerPage.value = limit;

expensePerPage.addEventListener('change', (event) => {
  limit = parseInt(event.target.value);
  localStorage.setItem('expensePerPage', limit);
  getExpense(page, limit);
});

async function add(event){
    event.preventDefault();

    const { amount, description, category, note } = event.target;
     const expenseDetails = {
        amount: amount.value,
        description: description.value,
        category: category.value,
        note: note.value
    };
    try {
        const res = await axios.post('/expense/addExpense', expenseDetails, {
            headers: { Authorization: token }
        });

        const p = document.querySelector('.expense_message');
        p.textContent = '';

        const ul = document.querySelector('ul');
        if (ul.childElementCount && ul.childElementCount < limit) {
            showExpense(res.data.expense);
        } else {
            getExpense(lastPage + 1, limit);
        }

        event.target.reset(); 
    } catch (err) {
        const p = document.querySelector('.expense_message');
        p.textContent = err.response?.data?.error || 'An error occurred';
        p.style.color = 'red';
    }
}

window.addEventListener("DOMContentLoaded", () => {
    if(!token) {
        window.location.href = '/user/login'; // Redirect to login if token is not present
        return;
    }
    // Reset the form fields
    const form = document.querySelector('#expense_tracker');
    if (form) form.reset();

    expensePerPage.value = limit; // Set the initial value of the dropdown
    checkMembership();
    getExpense(page, limit);
});

async function checkMembership(){
    try {
        const res = await axios.get('/expense/payment_status', {
            headers: { Authorization: token }
        });
        if (res.data.orderStatus === 'SUCCESS') {
            const header = document.querySelector('.header');
            const h = header.querySelector('#premium');
            h.innerHTML = `
                You are a premium user 
                <button id="premiumBtn">Show leaderboard</button> 
                <button id="reportBtn">Show Report</button>
            `;

            const premiumBtn = header.querySelector('#premiumBtn');
            premiumBtn.onclick = async () => {
                try {
                    const res = await axios.get('/expense/leaderboard', {
                        headers: { Authorization: token }
                    });
                    showLeaderboard(res.data.leaderboard);
                } catch (err) {
                    const h2 = document.createElement('h2');
                    h2.id = 'leaderboard';
                    h2.textContent = 'Leaderboard:';
                    const p = document.createElement('p');
                    p.textContent = err.response?.data?.error || 'An error occurred';
                    p.style.color = 'red';
                    document.body.appendChild(h2);
                    document.body.appendChild(p);
                }
            };

            const reportBtn = header.querySelector('#reportBtn');
            reportBtn.onclick = () => {
                window.location.href = '/expense/report';
            };
        }
    
    } catch (err) {
        console.error('Membership check failed:', err.response?.data?.error || err.message);
    }
}

async function getExpense(page, limit) {
    const ul = document.querySelector(`ul`);
    ul.innerHTML = ''; // Clear previous expenses
    try {
        const res = await axios.get(`/expense/getExpense?page=${page}&limit=${limit}`, {
            headers: { Authorization: token }
        });

        res.data.expense.forEach(exp => showExpense(exp));
        showPagination(res.data);
    } catch (err) {
        if (page > 1) {
            const oldPagination = document.querySelector('.pagination');
            if (oldPagination) document.body.removeChild(oldPagination);
            getExpense(page - 1, limit);
        } else {
            const p = document.querySelector('.expense_message');
            p.textContent = err.response?.data?.error || err.message;
            p.style.color = 'red';
        }
    }
}

function showExpense(data){
    const ul=document.querySelector(`ul`);
    const li=document.createElement(`li`);
    li.id = `li_${data._id}`;
    li.innerHTML = `
        ${data.amount} - ${data.description} - ${data.category} - ${(data.note || 'no comments')}
        <button id="delete_${data._id}">Delete Expense</button>
    `;
    ul.appendChild(li);
    const deleteBtn = li.querySelector(`#delete_${data._id}`);
    deleteBtn.onclick = () => deleteExpense(data._id);
}

function showPagination({ totalPages, currentPage, nextPage, previousPage }) {
    // Remove old pagination if it exists
    const oldPagination = document.querySelector('.pagination');
     if (oldPagination) oldPagination.remove();
    // Create new pagination
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    document.body.appendChild(pagination);
    const createBtn = (pageNum, label = pageNum) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.onclick = () => getExpense(pageNum, limit);
        pagination.appendChild(btn);
    };

    if (previousPage) createBtn(previousPage);
    createBtn(currentPage, `[${currentPage}]`); // highlight current
    if (nextPage) createBtn(nextPage);
    if (totalPages !== currentPage && totalPages !== nextPage) createBtn(totalPages);
}

async function deleteExpense(expenseId){
    try {
    const res = await axios.delete(`/expense/deleteExpense/${expenseId}`, {
      headers: { Authorization: token }
    });

    const p = document.querySelector('.expense_message');
    p.textContent = res.data.message;
    p.style.color = 'green';

    // Only remove from DOM if backend confirmed deletion
    if (res.data.message === 'Expense deleted successfully') {
      const ul = document.querySelector('ul');
      const li = ul.querySelector(`#li_${expenseId}`);
      if (li) ul.removeChild(li);

      // Refresh if list is empty or pagination exists
      if (ul.childElementCount === 0 || nextPage) {
        getExpense(page, limit);
      }
    }
  } catch (err) {
    const p = document.querySelector('.expense_message');
    p.textContent = err.response?.data?.error || 'An error occurred';
    p.style.color = 'red';
  }
}

function showLeaderboard(data){
    // Remove old leaderboard header if it exists
    document.querySelector('#leaderboard')?.remove();

    // Remove old leaderboard list if it exists
    document.querySelector('.leaderboard')?.remove();

    const h = document.createElement('h2');
    h.id = 'leaderboard';
    h.textContent = 'Leaderboard:';
    const ul = document.createElement('ul');
    ul.className = 'leaderboard';
 
    data.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `Name: ${user.name} - Total Expense: ${user.totalExpense}`;
        ul.appendChild(li);
    });
    document.body.appendChild(h);
    document.body.appendChild(ul);
}

const header = document.querySelector('.expense_header');
const downloadBtn = header.querySelector('#downloadBtn');
downloadBtn.onclick = async () => {
    try {
        const res = await axios.get('/expense/downloadExpenses', {
        headers: { Authorization: token }
    });

    // Trigger file download
    const a = document.createElement('a');
    a.href = res.data.fileURL;
    a.download = 'myexpenses.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Show downloaded files list
    showDownloadedFiles(res.data.downloadDetails);
  } catch (err) {
        const p = document.querySelector('.expense_message');
        p.textContent = err.response?.data?.error || 'An error occurred';
        p.style.color = 'red';
        console.log(err);
  }
}

function showDownloadedFiles(data) {
    // Remove old downloaded files list if it exists
    document.querySelector('.downloaded_files_header')?.remove();
    document.querySelector('.downloaded_files')?.remove();
    // Create new downloaded files list
    const h = document.createElement('h2');
    h.className = 'downloaded_files_header';
    h.textContent = 'Downloaded Files:';
    document.body.appendChild(h);
    // Create a new unordered list for downloaded files
    const ul = document.createElement('ul');
    ul.className = 'downloaded_files';
     data.forEach(file => {
        const li = document.createElement('li');
        li.innerHTML = `Date: ${new Date(file.date).toLocaleString()} - File URL: <a href="${file.fileUrl}" download>Download</a>`;
        ul.appendChild(li);
    });
    document.body.appendChild(ul);

}