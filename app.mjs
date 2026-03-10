//app.mjs
import 'dotenv/config'; 
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;  

app.use(express.static(join(__dirname, 'public')));
app.use(express.json()); 
app.use('/styles', express.static(join(__dirname, 'styles')));
app.use('/js', express.static(join(__dirname, 'js')));

//Creates New mongo client with settings.
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//Database connection
async function connectToMongo() {
  try {
    //Connects to the database client
    await client.connect();
    //Pings the database client to confirm connection
    await client.db("admin").command({ ping: 1 });
    //console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
connectToMongo();


// gets the main page, or index
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html')) ;
})


// API Health/Endpoints Documentation
app.get('/api/health', (req, res) => {
  const endpoints = [
    {
      method: 'GET',
      path: '/',
      description: 'Serve the main HTML page'
    },
    {
      method: 'GET',
      path: '/inject',
      description: 'Serve HTML with server-side variable injection'
    },
    {
      method: 'GET',
      path: '/api/health',
      description: 'This shows the available endpoints'
    },
    {
      method: 'POST',
      path: '/api/budgets',
      description: 'CREATE - adds a new budget to the database'
    },
    {
      method: 'GET',
      path: '/api/budgets',
      description: 'READ - retrieves all budgets'
    },
    {
      method: 'PUT',
      path: '/api/budgets/:id',
      description: 'UPDATE - Updates an existing budget'
    },
    {
      method: 'DELETE',
      path: '/api/budgets/:id',
      description: 'DELETE - Removes an exising budget'
    }
  ];

  res.json({
    status: 'healthy',
    server: 'CIS 486 DevOps Server',
    timestamp: new Date().toISOString(),
    endpoints: endpoints
  });
});


// CRUD Operations for budgets
// CREATE - Add a budget
//This post request is set up for the budgets api
//it collects the request body and creates a budget record if the information isnt null
app.post('/api/budgets', async (req, res) => {
  try {
    const { name,
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
      remaining } = req.body;
    
    if (name == null || income == null || transportation == null || rent == null || groceries == null || utility == null || household == null || entertainment == null || clothes == null || healthcare == null || totalExpenses == null || remaining == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = client.db('cis486');
    const collection = db.collection('budgets');
    
    const budgetRecord = {
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
      remaining,
      timestamp: new Date()
    };

    //Then it takes the budget and inserts it into the database collection an sends a message to the user.
    const result = await collection.insertOne(budgetRecord);
    res.json({ message: 'Budget recorded!', id: result.insertedId });
  } catch (error) {
    //console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to record budget' });
  }
});

// READ - retrieves all of the budgets
// a get request that is also set up for the budget api.
app.get('/api/budgets', async (req, res) => {
  try {
    const db = client.db('cis486');
    const collection = db.collection('budgets');
    
    //sends all of the budgets to the api in json format after converting them to an array.
    const budgets = await collection.find({}).toArray();
    res.json(budgets);
  } catch (error) {
    //console.error('Error reading budgets:', error);
    res.status(500).json({ error: 'Failed to get budget records' });
  }
});

// UPDATE - Updates an exising budget based on id
// Specifices the request body and assigns it to an array.
app.put('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name,
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
      remaining,
     } = req.body;
    
    const db = client.db('cis486');
    const collection = db.collection('budgets');
    
    //Updates the collection with the revised information 
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name,
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
      remaining,
      updatedAt: new Date() } }
    );
    
    //Sends error if there are no records that match
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'budget not found' });
    }
    
    res.json({ message: 'Budget updated!' });
  } catch (error) {
    //console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// DELETE - Deletes an existing budget based on id
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = client.db('cis486');
    const collection = db.collection('budgets');
    
    //deletes the record based on the id
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    //sends error if there are no matching budgets
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'budget not found' });
    }
    
    res.json({ message: 'Budget deleted!' });
  } catch (error) {
    //console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

//starts the server. 
app.listen(3000, () => {
  //console.log('Server is running on http://localhost:3000')
})
