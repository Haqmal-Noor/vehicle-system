const express = require("express");
const router = express.Router();
const connection = require("../db");
const { name } = require("ejs");

// SHOWING ALL VEHICLES
router.get("/", (req, res) => {
	connection.query(
		`SELECT vehicle.id, name, vehicle_type, palate_number, color, chasi_number, car_condition, engine_number, notes FROM vehicle 
			JOIN employee ON vehicle.driver_id = employee.id ORDER BY vehicle.id DESC`,
		(err, result) => {
			if (err) {
				console.error("Error fetching vehicles:", err);
				return res.status(500).send("Server error");
			}
			console.log(result);
			res.render("cars", { result: result });
		}
	);
});

// ADDING A VEHICLE
router.get("/add_vehicle", (req, res) => {
	connection.query(
		"SELECT driver.EmployeeID, employee.name FROM driver JOIN employee ON employee.id = driver.EmployeeID ORDER BY driver.DriverID DESC",
		(err, result) => {
			if (err) {
				console.log(err);
			}
			res.render("add-car", { result: result });
		}
	);
});

router.post("/add_vehicle", (req, res) => {
	const query = `INSERT INTO vehicle (driver_id, vehicle_type, palate_number, color, chasi_number, car_condition, engine_number, notes) VALUES(${req.body.driver_id}, '${req.body.vehicle_type}', ${req.body.palate_number}, '${req.body.color}', '${req.body.chasi_number}', '${req.body.car_condation}', '${req.body.engine_number}', '${req.body.notes}');`;
	connection.query(query, (err, results) => {
		if (err) {
			console.log(err);
		}
		res.redirect("/vehicles");
	});
});

// DELETING VEHICLE
router.post("/:id/delete", (req, res) => {
	const employeeId = req.params.id;
	connection.query(
		"DELETE FROM vehicle WHERE id = ?",
		[employeeId],
		(err, result) => {
			if (err) {
				console.error("Error deleting employee:", err);
				return res.status(500).send("Server error");
			}
			res.redirect("/vehicles");
		}
	);
});

// UPDATE VEHICLE
router.get("/update_vehicle/:id", (req, res) => {
	const vehicleId = req.params.id;
	connection.query(
		"SELECT * FROM vehicle WHERE id = ?",
		[vehicleId],
		(err, result) => {
			if (err) {
				console.error("Error while fetching data for vehicle update:", err);
				return res.status(500).send("Server error");
			}
			connection.query(
				"SELECT driver.EmployeeID, employee.name FROM employee JOIN driver ON  driver.EmployeeID = employee.id",
				(err, names) => {
					// res.send({ name: names, result: result });
					res.render("update-vehicle", { names: names, result: result[0] });
				}
			);
		}
	);
});

router.post("/update_vehicle/:id", (req, res) => {
	vehicleId = req.params.id;
	const {
		driver_id,
		vehicle_type,
		palate_number,
		color,
		chasi_number,
		car_condition,
		engine_number,
		notes,
	} = req.body;
	const query = `UPDATE vehicle SET driver_id = ${driver_id}, vehicle_type = '${vehicle_type}', palate_number = '${palate_number}', color = '${color}', chasi_number = '${chasi_number}', car_condition = '${car_condition}', engine_number = '${engine_number}', notes = '${notes}' WHERE id = ${vehicleId}`;
	connection.query(query, (err, result) => {
		if (err) {
			console.error("Error updating vehicle details:", err);
			res.status(500).send("Server error");
		}
		res.redirect("/vehicles");
	});
});

module.exports = router;
