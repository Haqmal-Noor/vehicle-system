const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

// Set up the views directory and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import routes
const employeeRoutes = require("./routes/employees");
const letterRoutes = require("./routes/letters");
const vehicleRoutes = require("./routes/vehicles");
const dashboardRoutes = require("./routes/dashboard");

// Use the routes
app.use("/employees", employeeRoutes);
app.use("/letters", letterRoutes);
app.use("/vehicles", vehicleRoutes);
app.use(dashboardRoutes);

app.get("/", (req, res) => {
	res.render("index");
});

// Start the server
app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
