const express = require("express");
const router = express.Router();
const notesControllers = require("../controllers/noteController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.post("/", notesControllers.createNewNote);
router.get("/", notesControllers.getAllNotes);
router.patch("/", notesControllers.updateNote);
router.delete("/", notesControllers.deleteNote);

module.exports = router;
