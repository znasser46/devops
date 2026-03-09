//app.mjs
//we are in ES6, use this. 
import 'dotenv/config'; 
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';  // For async file reading
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

//const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;  
const myVar = 'injected from server'; // Declare your variable


app.use(express.static(join(__dirname, 'public')));
app.use(express.json()); 




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongo() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
connectToMongo();


// middlewares aka endpoints aka 'get to slash' {http verb} to slash {you name ur endpoint}
app.get('/', (req, res) => {
  // res.send('Hello Express'); //string response
  // res.sendFile('index.html'); // <- this don't work w/o imports, assign, and arguements
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
      description: 'Show all available API endpoints'
    },
    {
      method: 'GET',
      path: '/api/class',
      description: 'Get class information (course details)'
    },
    {
      method: 'POST',
      path: '/api/budgets',
      description: 'CREATE - Add new student attendance record',
      bodyExample: {
        studentName: 'John Doe',
        date: 'February 3, 2026',
        keyword: 'devops'
      }
    },
    {
      method: 'GET',
      path: '/api/budgets',
      description: 'READ - Get all attendance records'
    },
    {
      method: 'PUT',
      path: '/api/budgets/:id',
      description: 'UPDATE - Update existing attendance record',
      bodyExample: {
        studentName: 'Jane Doe',
        date: 'February 3, 2026',
        keyword: 'mongodb'
      }
    },
    {
      method: 'DELETE',
      path: '/api/budgets/:id',
      description: 'DELETE - Remove attendance record'
    }
  ];

  res.json({
    status: 'healthy',
    server: 'CIS 486 DevOps Server',
    timestamp: new Date().toISOString(),
    endpoints: endpoints
  });
});

// Class Information API
app.get('/api/class', (req, res) => {
  const classInfo = {
    courseNumber: 'CIS 486',
    courseName: 'Projects in IS',
    nickname: 'Full Stack DevOps',
    semester: 'Spring 2026',
    calendar: 'Class calendar coming soon!'
  };
  res.json(classInfo);
});

// CRUD Operations for Attendance

// CREATE - Add student attendance
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
    
    // if (!studentName || !date || !keyword) {
    //   return res.status(400).json({ error: 'Missing required fields' });
    // }

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
    
    const result = await collection.insertOne(budgetRecord);
    res.json({ message: 'Budget recorded!', id: result.insertedId });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to record budget' });
  }
});

// READ - Get all attendance records
app.get('/api/budgets', async (req, res) => {
  try {
    const db = client.db('cis486');
    const collection = db.collection('budgets');
    
    const budgets = await collection.find({}).toArray();
    res.json(budgets);
  } catch (error) {
    console.error('Error reading budgets:', error);
    res.status(500).json({ error: 'Failed to get budget records' });
  }
});

// UPDATE - Update attendance record
app.put('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, date, keyword } = req.body;
    
    const db = client.db('cis486');
    const collection = db.collection('attendance');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { studentName, date, keyword, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Attendance updated!' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// DELETE - Delete attendance record
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = client.db('cis486');
    const collection = db.collection('attendance');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Attendance deleted!' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
});



//start the server. 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
