
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// middlewares aka endpoints aka "get to slash" {http verb} to slash {you name your endpoint}
app.get('/', (req, res) => {
  //res.send('Hello Express'); //string response
  //res.sendFile('index.html');
  res.sendFile(join(__dirname, 'public', 'index.html'));
})


app.get('/json', (req, res) => {
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
})
