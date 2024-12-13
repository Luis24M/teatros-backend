const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnection = require("./utils/dbConnection");
const path = require("path");
const logger = require('morgan');


const router = express.Router();

// Cargar variables de entorno
dotenv.config();

// Inicializar la app
const app = express();
dbConnection(); // Conexión a MongoDB
app.use(logger('dev'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Middlewares
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000', // replace with your Next.js frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

// Rutas
router.get("/api/nueva",async(req,res) => {
    res.send("hola");
})

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use(router)
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;
