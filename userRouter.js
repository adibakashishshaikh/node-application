const express = require("express");

module.exports = function (dbHandler) {
  const router = express.Router();

  // Get All Users
  router.get("/", async (req, res) => {
    try {
      const users = await dbHandler.query("SELECT * FROM users");
      res.status(200).json({
        result: "SUCCESS",
        message: users?.rows ?? [],
      });
    } catch (error) {
      res.status(500).json({
        result: "ERROR",
        message: error.message,
      });
    }
  });

  //Get user BY Id
  router.get("/:id", async (req, res) => {
    try {
      const userId = req.params.id;

      const userExistsQuery = "SELECT * FROM users WHERE id = $1";
      const user = await dbHandler.query(userExistsQuery, [userId]);

      if (user.rows.length === 0) {
        return res.status(404).json({
          result: "ERROR",
          message: `User not found for ID: ${userId}`,
        });
      }

      const usersQuery = "SELECT * FROM users WHERE id = $1";
      const users = await dbHandler.query(usersQuery, [userId]);

      res.status(200).json({
        result: "SUCCESS",
        message: users?.rows ?? [],
      });
    } catch (error) {
      res.status(500).json({
        result: "ERROR",
        message: error.message,
      });
    }
  });

  //Create new User
  router.post("/", async (req, res) => {
    try {
      const { id, firstname, lastname, location } = req.body;

      const result = await dbHandler.query(
        "INSERT INTO users ( id,firstname,lastname,location) VALUES ($1, $2, $3,$4) RETURNING id",
        [id, firstname, lastname, location]
      );

      res.status(201).json({
        result: "SUCCESS",
        message: `User with ID ${result.rows[0].id} has been created`,
      });
    } catch (error) {
      res.status(500).json({
        result: "ERROR",
        message: error.message,
      });
    }
  });

  //Update user
  router.post("/:id", async (req, res) => {
    try {
      const { id, firstname, lastname, location } = req.body;
      const user = await dbHandler.query(`select * from users where id=${id}`);

      if (!user.rows[0]) {
        throw new Error(`user with id:${id} does not exist`);
      }

      const updateQuery =
        "UPDATE users SET  firstname = $2, lastname = $3, location = $4 WHERE id = $1";
      const updateValues = [id, firstname, lastname, location];
      await dbHandler.query(updateQuery, updateValues);
      const updatedUser = await dbHandler.query(
        `select * from users where id=${id}`
      );

      res.status(200).json({
        result: "SUCCESS",
        message: updatedUser.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        result: "ERROR",
        message: error.message,
      });
    }
  });

  //Delete user
  router.delete("/:id", async (req, res) => {
    try {
      const userId = req.params.id;

      const deleteQuery = "DELETE FROM users WHERE id = $1";
      await dbHandler.query(deleteQuery, [userId]);

      res.status(200).json({
        result: "SUCCESS",
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        result: "ERROR",
        message: error.message,
      });
    }
  });

  return router;
};
