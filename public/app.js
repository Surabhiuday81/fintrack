document.addEventListener("DOMContentLoaded", () => {
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");

  
  const fetchExpenses = async () => {
    try {
      const response = await fetch('/expenses');
      const expenses = await response.json();

      expenseList.innerHTML = ''; 

      expenses.forEach(expense => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.innerHTML = `
          <span>${expense.title} - $${expense.amount} - ${expense.category} - ${new Date(expense.date).toLocaleDateString()}</span>
          <button data-id="${expense._id}" class="btn btn-warning btn-sm edit-btn">Edit</button>
          <button data-id="${expense._id}" class="btn btn-danger btn-sm delete-btn">Delete</button>
        `;
        expenseList.appendChild(listItem);
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  
  expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;

    try {
      await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount, date, category }),
      });
      expenseForm.reset();
      fetchExpenses(); 
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  });

  
  expenseList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.getAttribute("data-id");
      try {
        await fetch(`/delete/${id}`, { method: 'DELETE' });
        fetchExpenses(); 
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  });

  
  expenseList.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const id = e.target.getAttribute("data-id");
      const expense = e.target.closest("li");
      const title = expense.querySelector("span").textContent.split(" - ")[0];
      const amount = expense.querySelector("span").textContent.split(" - ")[1].slice(1);
      const date = expense.querySelector("span").textContent.split(" - ")[3];
      const category = expense.querySelector("span").textContent.split(" - ")[2];

      
      document.getElementById("title").value = title;
      document.getElementById("amount").value = amount;
      document.getElementById("date").value = date;
      document.getElementById("category").value = category;

     
      expenseForm.removeEventListener("submit", addExpense); 
      expenseForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const updatedTitle = document.getElementById("title").value;
        const updatedAmount = document.getElementById("amount").value;
        const updatedDate = document.getElementById("date").value;
        const updatedCategory = document.getElementById("category").value;

        try {
          await fetch(`/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: updatedTitle,
              amount: updatedAmount,
              date: updatedDate,
              category: updatedCategory,
            }),
          });
          expenseForm.reset();
          fetchExpenses(); 
        } catch (error) {
          console.error("Error updating expense:", error);
        }
      });
    }
  });

  
  fetchExpenses();
});
