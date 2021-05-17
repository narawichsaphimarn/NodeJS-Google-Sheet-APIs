require("./google");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const route = require("./router");

const app = express();
const port = 3001;
app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
route(app);
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));
