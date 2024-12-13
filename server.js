const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const Event = require("./models/Event");
const User = require("./models/User");


const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);


  socket.on("joinEvent", async (eventId) => {
    console.log(`Usuario unido al evento: ${eventId}`);
    const event = await Event.findById(eventId);
    if (event) {
      socket.emit("updateObra", event);
      console.log("Evento encontrado y enviado:", event);
    } else {
      console.log("Evento no encontrado:", eventId);
    }
  });

  socket.on("selectSeat", async (seatNumber, userId, eventId) => {
    try {
      // Obtener el evento por su ID
      const event = await Event.findById(eventId);
      if (!event) {
        console.log("Evento no encontrado dfsfsd");
        return;
      }
  
      // Buscar la butaca correspondiente en el arreglo de seats
      const seatIndex = event.seats.findIndex((seat) => seat.seatNumber === seatNumber);
  
      if (seatIndex === -1) {
        console.log("Butaca no encontrada");
        return;
      }
  
      const seat = event.seats[seatIndex];
  
      // Verificar si la butaca ya está reservada
      if (seat.reserved) {
        console.log("Butaca ya reservada");
        return;
      }
  
      // Actualizar la butaca (marcar como seleccionada por el usuario actual)
      seat.selecting = true;
      seat.selectedBy = userId;
  
      // Guardar los cambios en el evento
      event.seats[seatIndex] = seat; // Actualizar el asiento en el array
      await event.save(); // Guardar cambios en la base de datos
  
      // Emitir la actualización a todos los clientes conectados
      io.emit("updateObra", event); // Enviar el evento actualizado
    } catch (error) {
      console.error("Error al seleccionar la butaca:", error);
    }
  });
  


  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});