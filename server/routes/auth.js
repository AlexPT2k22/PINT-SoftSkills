const express = require("express");
const router = express.Router();
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "../database/users.json");
let users = require(usersFilePath);
const linkedin_url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&state=foobar&scope=liteprofile%20emailaddress`;
