const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

app.post('/api/waste', async (req, res) => {
  try {
    const { wasteData } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    console.log('Received wasteData:', JSON.stringify(wasteData, null, 2));

    const rows = Object.entries(wasteData).map(([category, values]) => {
      const row = [
        date,                   // Date
        time,                   // Time
        category,               // Category
        values.total,           // Total
        values.quality,         // Quality Count
        values.expired,         // Expired Count
        values.flavor          // Flavor
      ];
      console.log('Created row:', row);
      return row;
    });

    console.log('Final rows to be inserted:', rows);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 