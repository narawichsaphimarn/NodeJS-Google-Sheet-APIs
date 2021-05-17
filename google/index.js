const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "google/config/token.json";
const KEYS = "google/config/keys.json";

// Load client secrets from a local file.
fs.readFile(KEYS, (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error while trying to retrieve access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: "1e2czb16DircRlYZeek4wv18I98Kk18UlvGIeX5-CbGk",
      range: "AKAI!A5:W",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const rows = res.data.values;
      if (rows.length) {
        console.log("Name, Major:");
        console.log(JSON.stringify(rows));
        // Print columns A and E, which correspond to indices 0 and 4.
        // rows.map((row) => {
        //   console.log(`${row[0]}, ${row[4]}`);
        // });
      } else {
        console.log("No data found.");
      }
    }
  );

  // let values = [
  //   ["Item", "Cost", "Stocked", "Ship Date"],
  //   ["Wheel", "$20.50", "4", "3/1/2016"],
  //   ["Door", "$15", "2", "3/15/2016"],
  //   ["Engine", "$100", "1", "3/20/2016"],
  //   ["Totals", "=SUM(B2:B4)", "=SUM(C2:C4)", "=MAX(D2:D4)"],
  // ];
  // const resource = {
  //   values: values,
  // };
  // sheets.spreadsheets.values.update(
  //   {
  //     spreadsheetId: "1Sc3avjn3a0l4A-wMpkI571JJf41wT0DTQiCg7gE4lEo",
  //     range: "Sheet1!A1:D5",
  //     valueInputOption: "RAW",
  //     resource: resource,
  //   },
  //   (err, result) => {
  //     if (err) {
  //       // Handle error
  //       console.log(err);
  //     } else {
  //       console.log("%d cells updated.", result.updatedCells);
  //     }
  //   }
  // );
}
