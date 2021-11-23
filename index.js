'use strict';
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

let app = express();
app.use(cors({origin: '*'}));

// var options = {
//   key: fs.readFileSync('perm/client-key.pem'),
//   cert: fs.readFileSync('perm/client.csr')
// };

// google 
const auth = process.env.APIKEY;
const sheets = google.sheets({ version: "v4", auth: auth })

// globals 
const port = process.env.PORT || 9000;
const spreadsheetId = process.env.SHEETID;

app.get('/All', async (req, res) => {
  try {
    const retrieved  = await sheets.spreadsheets.values.get({
      auth: auth,
      spreadsheetId: spreadsheetId,
      range: "sorted",
    }).then(() => {console.log('Retrieved: all');
       res.json(retrieved.data.values)}
    , console.log('Retrieved Failed: all'))

  } catch (err){
    res.status(502).json({error: err});
  }
})

app.get('/player/:name', async (req, res) => {
  try {
    var retrieved = await sheets.spreadsheets.values.get({
      auth: auth,
      spreadsheetId: spreadsheetId,
      range: "sorted",
    })
    let name = req.params.name;
    let con_msg = "";
    let totaldata = retrieved.data.values;
    const playerIndex = findPlayer(totaldata, name);
  
    if (playerIndex < 0) {
      res.status(404).json({ error: 'Not Found' });;
      con_msg = "Retrieved failed: " + name;
    } else {
      res.json(totaldata[playerIndex]);
      con_msg = "Retrieved: " + name;
    }
    console.log(con_msg);
  } catch (err){
    res.status(502).json({error: err});
  }
})

function findPlayer(a, name) {
  //https://stackoverflow.com/questions/2167602/optimum-way-to-compare-strings-in-javascript
  a.shift();
  name = name.toLowerCase();

  let low = 0;
  let high = a.length - 1;
  let mid;

  while (low <= high) {
    mid = ~~((low + high) / 2);
    if (a[mid][0].toLowerCase().localeCompare(name) < 0)
      low = mid + 1;
    else if (a[mid][0].toLowerCase().localeCompare(name) > 0)
      high = mid - 1;
    else
      return mid;
  }
  return -1;
}

app.listen(port,(req, res) => {
  console.log('App online')
});