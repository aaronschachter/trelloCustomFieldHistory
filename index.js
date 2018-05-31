'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser')
const trello = require('./lib/trello');

const app = express();
  
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
  res.send('Hello World');
});

app.post('/webhook', (req, res) => {
  trello.handleWebhookRequest(req.body);
  res.send('Hello World');
});

const port = 3000;
app.listen(port, () => {
  console.log('Running on port', port);
  return trello.createWebhook()
    .then(res => console.log(res))
    .catch(err => console.log(err));
})
