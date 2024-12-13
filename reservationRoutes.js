const express = require("express");
const { createReservation, getUserReservations } = require("../controllers/reservationController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, createReservation);
router.get("/", verifyToken, getUserReservations);

module.exports = router;


router.post("/check", async (req, res) => {
    const { userId, eventId } = req.body;
    
    // Aquí puedes agregar lógica para validar la reserva del usuario
    const isAllowed = true; // Cambiar según lógica de negocio
  
    if (isAllowed) {
      res.status(200).json({ message: "Acceso permitido", connectSocket: true });
    } else {
      res.status(403).json({ message: "Acceso denegado" });
    }
  });
  