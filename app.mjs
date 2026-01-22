
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json()); 

// middlewares aka endpoints aka "get to slash" {http verb} to slash {you name your endpoint}
app.get('/', (req, res) => {
  //res.send('Hello Express'); //string response
  //res.sendFile('index.html');
  res.sendFile(join(__dirname, 'public', 'index.html'));
})


app.get('/api/json', (req, res) => {
  const myVar = 'Hello from server!';
  res.json({ myVar });
  // <a href="json/">json</a>
})

app.get('/api/query', (req, res) => {

  console.log("client request with query param:", req.query.name); 
  res.json({"name": req.query.name});
});

app.get('/api/body', (req, res) => {

  console.log("client request with body:", req.body);
  console.log("client request with body:", req.body.name); 
  res.json({"name": req.body.name});
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
})


