document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseReportContainer = document.getElementById('expense-report-container');
  
    const updateExpenseReport = async () => {
      try {
        const response = await fetch('/expense-summary');
        if (!response.ok) throw new Error('Failed to fetch expense summary.');
  
        const summary = await response.json();
  
        
        document.getElementById('total-expenses').textContent = `$${summary.total.toFixed(2)}`;
        document.getElementById('daily-expenses').textContent = `$${summary.daily.toFixed(2)}`;
        document.getElementById('weekly-expenses').textContent = `$${summary.weekly.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `$${summary.monthly.toFixed(2)}`;
  
        expenseReportContainer.style.display = 'block';
      } catch (error) {
        console.error('Error updating expense report:', error);
        expenseReportContainer.style.display = 'none';
      }
    };
  
    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const title = document.getElementById('title').value;
      const amount = document.getElementById('amount').value;
      const date = document.getElementById('date').value;
      const category = document.getElementById('category').value;
  
      try {
        const response = await fetch('/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, amount, date, category }),
        });
  
        if (response.ok) {
          alert('Expense added successfully!');
          updateExpenseReport();
          expenseForm.reset();
        } else {
          alert('Failed to add expense.');
        }
      } catch (error) {
        alert('Error adding expense.');
      }
    });
  
    
    updateExpenseReport();
  });
  