const express = require("express");
const router = express.Router();
const connection = require("../db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

// SHOWING ALL LETTERS
router.get("/", (req, res) => {
	connection.query("SELECT * FROM letter ORDER BY id DESC", (err, result) => {
		if (err) {
			console.error("Error fetching letters:", err);
			return res.status(500).send("Server error");
		}
		res.render("letters", { result: result });
	});
});

// ADDING A LETTER
router.get("/add_letter", (req, res) => {
	res.render("add-letter");
});

router.post("/add_letter", upload.single("file"), (req, res) => {
	if (!req.file) {
		return res.status(400).send("No file available");
	}

	const query = `INSERT INTO letter (export_number, export_date, subject, sender, receiver, letter_kind, file_pdf) 
    VALUES ('${req.body.export_number}', '${req.body.export_date}', '${req.body.subject}', '${req.body.sender}', '${req.body.receiver}', '${req.body.letter_kind}', '${req.file.path}')`;

	connection.query(query, (err, result) => {
		if (err) {
			console.error("Error inserting letter:", err);
			return res.status(500).send("Server error");
		}
		res.redirect("/letters");
	});
});

// DELETING A LETTER
router.post("/:id/delete", (req, res) => {
	const letterId = req.params.id;
	connection.query(
		"DELETE FROM letter WHERE id = ?",
		[letterId],
		(err, result) => {
			if (err) {
				console.error("Error deleting letter:", err);
				return res.status(500).send("Server error");
			}
			res.redirect("/letters");
		}
	);
});
// UPDATE LETTER
router.get("/update/:id", (req, res) => {
	const letterId = req.params.id;
	connection.query(
		"SELECT * FROM letter WHERE id = ?",
		[letterId],
		(err, result) => {
			if (err) {
				console.error("Error deleting letter:", err);
				return res.status(500).send("Server error");
			}

			res.render("update-letter", { result: result[0] });
		}
	);
});
router.post("/update/:id", upload.single("file"), (req, res) => {
	const letterId = req.params.id; // Get the ID from the route parameters
	const { export_number, export_date, subject, sender, receiver, letter_kind } =
		req.body;

	// Create a base query
	let query = `UPDATE letter SET export_number = ?, export_date = ?, subject = ?, sender = ?, receiver = ?, letter_kind = ?`;
	const values = [
		export_number,
		export_date,
		subject,
		sender,
		receiver,
		letter_kind,
	];

	// If a new file was uploaded, include it in the update
	if (req.file) {
		query += `, file_pdf = ?`;
		values.push(req.file.path);
	}

	// Complete the query to specify which record to update
	query += ` WHERE id = ?`;
	values.push(letterId);

	connection.query(query, values, (err, result) => {
		if (err) {
			console.error("Error updating letter:", err);
			return res.status(500).send("Server error");
		}
		res.redirect("/letters");
	});
});

module.exports = router;
