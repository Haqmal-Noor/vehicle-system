const mysql = require("mysql2");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "aspirine@123", 
	database: "transportation_db",
});

connection.connect((err) => {
	if (err) {
		console.error("Error connecting to the database:", err);
	} else {
		console.log("Connected to the database.");
	}
});

module.exports = connection;
