const express = require("express");
const router = express.Router();
const connection = require("../db"); // Assuming you will create a separate db.js for connection
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

// SELECTING ALL THE EMPLOYEES
router.get("/", (req, res) => {
	connection.query(
		`SELECT Employee.id, Employee.name, Employee.father_name, Employee.bast, Employee.hire_date, 
                Employee.id_card_number, Employee.email, department.department_name 
         FROM Employee 
         JOIN department ON Employee.department_id = department.id ORDER BY Employee.id DESC`,
		(err, rows) => {
			if (err) {
				console.error(err);
				res.status(500).send("Database error");
			} else {
				res.render("employees-list", { rows: rows });
			}
		}
	);
});

// SHOWING AN EMPLOYEE'S DETAILS
router.get("/employee_details/:id", (req, res) => {
	const employeeId = req.params.id;
	connection.query(
		`SELECT Employee.id, name, father_name, last_name, current_location, birth_location, birth_date, phone_number, email, employee_type, id_card_number, photo, hire_date,bast, department_id, department_name,
	DriverID, driver.EmployeeID, LicenseNumber, LicenseType, LicenseExpirationDate, DrivingExperienceYears, MedicalCertificate, AvailabilitySchedule
	FROM Employee LEFT JOIN driver ON Employee.id = driver.EmployeeID JOIN department ON department.id = employee.department_id WHERE Employee.id = ?`,
		[employeeId],
		(err, result) => {
			if (err) {
				console.error("Error fetching employee details:", err);
				res.status(500).send("Server error");
			} else if (result.length === 0) {
				res.status(404).send("Employee not found");
			} else {
				if (result[0].photo) {
					result[0].photo = result[0].photo.replace("uploads", "/uploads/");
				}

				res.render("employee-details", { employee: result[0] });
			}
		}
	);
});

// ADDING AN EMPLOYEE
router.get("/add_employee", (req, res) => {
	res.render("add-employee");
});

router.post("/add_employee", upload.single("file"), (req, res) => {
	if (!req.file) {
		return res.status(400).send("No file available");
	}

	const query = `INSERT INTO employee (name, father_name, last_name, current_location, birth_location, birth_date, phone_number, email, employee_type, id_card_number, photo, hire_date, department_id, bast) 
    VALUES ('${req.body.name}', '${req.body.fatherName}', '${req.body.lastName}', '${req.body.currentLocation}', '${req.body.birthLocation}', '${req.body.birthDate}', '${req.body.phoneNumber}', '${req.body.email}', '${req.body.employeeType}', '${req.body.idCardNumber}', '${req.file.path}', '${req.body.hireDate}', ${req.body.department}, '${req.body.bast}')`;

	connection.query(query, (err, result) => {
		if (err) {
			console.error("Error inserting employee:", err);
			return res.status(500).send("Server error");
		}
		res.redirect("/employees");
	});
});

// DELETING AN EMPLOYEE
router.post("/:id/delete", (req, res) => {
	const employeeId = req.params.id;
	connection.query(
		"DELETE FROM Employee WHERE id = ?",
		[employeeId],
		(err, result) => {
			if (err) {
				console.error("Error deleting employee:", err);
				return res.status(500).send("Server error");
			}
			res.redirect("/employees");
		}
	);
});

// ADDING A DRIVER

router.get("/add_driver", (req, res) => {
	connection.query(
		"SELECT id, name FROM employee LEFT JOIN driver ON employee.id = driver.EmployeeID WHERE driver.DriverID IS NULL ",
		(err, result) => {
			if (err) {
				console.log(err);
			}
			res.render("add-driver", { result: result });
		}
	);
});

router.post("/add_driver", (req, res) => {
	const query = `INSERT INTO driver (EmployeeID, LicenseNumber, LicenseType, LicenseExpirationDate, DrivingExperienceYears, MedicalCertificate, AvailabilitySchedule) VALUES (${req.body.name}, '${req.body.LicenseNumber}', '${req.body.LicenseType}', '${req.body.LicenseExpirationDate}', '${req.body.DriverExperienceYears}', '${req.body.MedicalCertificate}', '${req.body.AvailablitySchedule}')`;
	connection.query(query, (err, result) => {
		if (err) {
			console.log(err);
			return res.send("Error occurred while adding the driver");
		}
		res.redirect("/employees");
	});
});

// SHOW THE FORM FOR UPDATING AN EMPLOYEE (AND DRIVER IF APPLICABLE)
router.get("/update_employee/:id", (req, res) => {
	const employeeId = req.params.id;
	connection.query(
		`SELECT Employee.id, name, father_name, last_name, current_location, birth_location, birth_date, phone_number, email, employee_type, id_card_number, photo, hire_date, bast, department_id, department_name,
		DriverID, driver.EmployeeID, LicenseNumber, LicenseType, LicenseExpirationDate, DrivingExperienceYears, MedicalCertificate, AvailabilitySchedule
		FROM Employee LEFT JOIN driver ON Employee.id = driver.EmployeeID 
		JOIN department ON department.id = Employee.department_id 
		WHERE Employee.id = ?`,
		[employeeId],
		(err, result) => {
			if (err) {
				console.error("Error fetching employee details for update:", err);
				res.status(500).send("Server error");
			} else if (result.length === 0) {
				res.status(404).send("Employee not found");
			} else {
				res.render("update-employee", { employee: result[0] });
			}
		}
	);
});

// HANDLE FORM SUBMISSION FOR UPDATING EMPLOYEE (AND DRIVER IF APPLICABLE)

router.post("/update_employee/:id", (req, res) => {
	const employee_id = req.params.id;
	const {
		name,
		fatherName,
		lastName,
		currentLocation,
		birthLocation,
		birthDate,
		phoneNumber,
		email,
		employeeType,
		idCardNumber,
		hireDate,
		department,
		bast,
		LicenseNumber,
		LicenseType,
		LicenseExpirationDate,
		DrivingExperienceYears,
		MedicalCertificate,
		AvailabilitySchedule,
	} = req.body;
	const query = `UPDATE employee e LEFT JOIN driver d 
					ON e.id = d.EmployeeID 
					SET e.name = '${name}', e.father_name = '${fatherName}',
					 e.last_name = '${lastName}', e.current_location = '${currentLocation}', e.birth_location = '${birthLocation}',
					 e.birth_date = '${birthDate}', e.phone_number = '${phoneNumber}', e.email = '${email}', e.employee_type = '${employeeType}',
					 e.id_card_number = '${idCardNumber}', e.hire_date = '${hireDate}', e.department_id = '${department}', e.bast = '${bast}',
					 d.LicenseNumber = '${LicenseNumber}', d.LicenseType = '${LicenseType}', d.LicenseExpirationDate = '${LicenseExpirationDate}',
					 d.DrivingExperienceYears = '${DrivingExperienceYears}', d.MedicalCertificate = '${MedicalCertificate}', d.AvailabilitySchedule = '${AvailabilitySchedule}'
					WHERE e.id = ${employee_id}; `;
	connection.query(query, (err, result) => {
		if (err) {
			console.error("Error updating employee details:", err);
			res.status(500).send("Server error");
		}
		res.redirect(`/employees/employee_details/${employee_id}`);
	});
});

module.exports = router;
