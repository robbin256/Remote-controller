const express = require('express');
const path = require('path');

const app = express();
const port =  8080;
const root = path.resolve(__dirname, 'public');

app.use(express.static(root));

app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

app.listen(port, () => {
  console.log(`Express static server running at http://localhost:${port}/`);
});
