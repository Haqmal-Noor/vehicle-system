const express = require("express");
const router = express.Router();
const connection = require("../db");

router.get("/dashboard", (req, res) => {
	const query = `
        SELECT 
            (SELECT COUNT(*) FROM Employee) AS employeeCount,
            (SELECT COUNT(*) FROM Vehicle) AS vehicleCount,
            (SELECT COUNT(*) FROM Letter WHERE letter_kind = 'وارده') AS letterCount
    `;

	connection.query(query, (err, rows) => {
		if (err) {
			console.error("Error fetching data:", err);
			res.status(500).send("Server error");
		} else {
			const counts = rows[0];
			res.render("dashboard", { counts: counts });
		}
	});
});

module.exports = router;
