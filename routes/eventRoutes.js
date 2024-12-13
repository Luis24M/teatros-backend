const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addComment,
  reserveSeat,
} = require("../controllers/eventController");
const { verifyToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/", upload.single("image"), verifyToken, createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", upload.single("image"), verifyToken, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);
router.post("/:id/comments", verifyToken, addComment);
router.post("/:id/reserve", verifyToken, reserveSeat);
module.exports = router;
