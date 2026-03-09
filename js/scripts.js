document.addEventListener("DOMContentLoaded", () => {
    let editingId = null;



    // Handle form submission
    document.getElementById('budgetForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const income = document.getElementById('income').value;
      const transportation = document.getElementById('transportation').value;
      const rent = document.getElementById('rent').value;
      const groceries = document.getElementById('groceries').value;
      const utility = document.getElementById('utility').value;
      const household = document.getElementById('household').value;
      const entertainment = document.getElementById('entertainment').value;
      const clothes = document.getElementById('clothes').value;
      const healthcare = document.getElementById('healthcare').value;


      const totalExpenses =
        Number(transportation) +
        Number(rent) +
        Number(groceries) +
        Number(utility) +
        Number(household) +
        Number(entertainment) +
        Number(clothes) +
        Number(healthcare);

      const remaining = Number(income) - totalExpenses;

      try {
        const url = editingId ? `/api/budgets/${editingId}` : '/api/budgets';
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            income,
            transportation,
            rent,
            groceries,
            utility,
            household,
            entertainment,
            clothes,
            healthcare,
            totalExpenses,
            remaining
          })
        });

        const result = await response.json();


       

        if (response.ok) {
          showMessage(result.message, 'success');
          document.getElementById('budgetForm').reset();
          if (editingId) {
            editingId = null;
            document.querySelector('button[type="submit"]').textContent = 'Save Budget';
          }
          loadBudgets();
        } else {
          showMessage(result.error, 'error');
        }
      } catch (error) {
        showMessage('Error submitting form', 'error');
      }
    });

    // Load attendance records
    async function loadBudgets() {
      try {
        const response = await fetch('/api/budgets');
        const records = await response.json();

        const listDiv = document.getElementById('budgetList');

        if (records.length === 0) {
          listDiv.innerHTML = '<p>No budget records yet.</p>';
          return;
        }

        listDiv.innerHTML = records.map(budget => `
          <div class="record">
        <strong>${budget.name}</strong> - Monthly Income: $${budget.income}<br>
        Expenses: Transportation $${budget.transportation}, Rent $${budget.rent}, Groceries $${budget.groceries}, Utility $${budget.utility}, Household $${budget.household}, Entertainment $${budget.entertainment}, Clothes $${budget.clothes}, Healthcare $${budget.healthcare}<br>
        <strong>Total Expenses:</strong> $${budget.totalExpenses} | <strong>Remaining:</strong> $${budget.remaining}<br>  <button class="edit-btn" onclick="editBudget('${budget._id}', '${budget.name}', '${budget.income}', '${budget.transportation}', '${budget.rent}', '${budget.groceries}', '${budget.utility}', '${budget.household}', '${budget.entertainment}', '${budget.clothes}' , '${budget.healthcare}')">Edit</button> 
        <button class="delete-btn" onclick="deleteBudget('${budget._id}')">Delete</button>
        <small>Recorded on: ${new Date(budget.timestamp).toLocaleString()}</small>
      </div>
      <hr>
    `).join('');
      } catch (error) {
        document.getElementById('budgetList').innerHTML = 'Error loading budget records';
      }
    }

    // Edit record
    function editBudget(id, name, income, transportation, rent, groceries, utility, household, entertainment, clothes, healthcare, totalExpenses, remaining) {
      editingId = id;
      document.getElementById('name').value = name;
      document.getElementById('income').value = income;
      document.getElementById('transportation').value = transportation;
      document.getElementById('rent').value = rent;
      document.getElementById('groceries').value = groceries;
      document.getElementById('utility').value = utility;
      document.getElementById('household').value = household;
      document.getElementById('entertainment').value = entertainment;
      document.getElementById('clothes').value = clothes;
      document.getElementById('healthcare').value = healthcare;
      document.querySelector('button[type="submit"]').textContent = 'Update Budget';
      showMessage('Editing budget - click Update to save changes', 'success');
    }

    // Delete record
    async function deleteBudget(id) {
      if (!confirm('Are you sure you want to delete this budget?')) return;

      try {
        const response = await fetch(`/api/budgets/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
          showMessage(result.message, 'success');
          loadBudgets();
        } else {
          showMessage(result.error, 'error');
        }
      } catch (error) {
        showMessage('Error deleting record', 'error');
      }

    }

    // Show message
    function showMessage(text, type) {
      const messageDiv = document.getElementById('message');
      messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
      setTimeout(() => {
        messageDiv.innerHTML = '';
      }, 3000);
    }

    // Initialize page

    loadBudgets();

    // Set today's date as default
    // document.getElementById('date').value = 'February 3, 2026';


  });