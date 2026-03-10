
let editingId = null;

// Handle form submission
//This section is an event listener for the main form to be submitted. Once the form is submitted each value from the form is stored as a variable.
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

  //This calculates the total expenses remaining based on all of the data entered in the forms.
  const totalExpenses =
    Number(transportation) +
    Number(rent) +
    Number(groceries) +
    Number(utility) +
    Number(household) +
    Number(entertainment) +
    Number(clothes) +
    Number(healthcare);

  //Once that total is calculated it is subtracted from the monthly income to get the remainging value, or discretionary income.
  const remaining = Number(income) - totalExpenses;

  //This section is dynamically determinging whether the url should be set for creating a new record or editing an existing one.
  //Then it turns the javascript objects into json format using stringify.
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

//This function fetches the budgets api to dynamically generate the budget list at the bottom of the index page.
//once it gets the list id, it creates a new div for each budget and stores its information.
async function loadBudgets() {
  try {
    const response = await fetch('/api/budgets');
    const budgets = await response.json();

    const budList = document.getElementById('budgetList');

    if (budgets.length === 0) {
      budList.innerHTML = '<p>No budgets yet.</p>';
      return;
    }

    budList.innerHTML = budgets.map(budget => `
          <div class="record">
        <strong>${budget.name}</strong> - Monthly Income: $${budget.income}<br>
        <strong>Expenses:</strong> Transportation $${budget.transportation}, Rent $${budget.rent}, Groceries $${budget.groceries}, Utility $${budget.utility}, Household $${budget.household}, Entertainment $${budget.entertainment}, Clothes $${budget.clothes}, Healthcare $${budget.healthcare}<br>
        <strong>Total Expenses:</strong> $${budget.totalExpenses} | <strong>Discretionary Income:</strong> $${budget.remaining}<br>  <button class="edit-btn btn btn-secondary" onclick="editBudget('${budget._id}', '${budget.name}', '${budget.income}', '${budget.transportation}', '${budget.rent}', '${budget.groceries}', '${budget.utility}', '${budget.household}', '${budget.entertainment}', '${budget.clothes}' , '${budget.healthcare}')">Edit</button> 
        <button class="delete-btn btn btn-danger" onclick="deleteBudget('${budget._id}')">Delete</button>
        <small>Recorded on: ${new Date(budget.timestamp).toLocaleString()}</small>
      </div>
      <hr>
    `).join('');
  } catch (error) {
    document.getElementById('budgetList').innerHTML = 'Error loading budgets';
  }
}

// Edit record
//This function takes a parameter for each attribute associated with a record in the database so that it can update the contents of it.
//It uses a query selector to change the submit button to update and invokes the message function to guide the user.
function editBudget(id, name, income, transportation, rent, groceries, utility, household, entertainment, clothes, healthcare) {
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
//This function deletes an element based on the id that is passed to it. 
//It Makes the user verift that they want to delete before fetching the budgets api based on id, then deleting.
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

//Function created to construct message for the user to see.
function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 4000);
}

//Loads the budgets onto the page
loadBudgets();