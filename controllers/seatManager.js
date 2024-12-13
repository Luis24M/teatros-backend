const Event = require("../models/Event");

class SeatManager {
  constructor(io) {
    this.io = io;
    this.tempReservedSeats = new Map(); // To track seats being selected
  }

  async reserveSeat(eventId, seatNumber, userId, userName) {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw new Error("Evento no encontrado");

      const seat = event.seats.find(s => s.seatNumber === seatNumber);
      if (!seat) throw new Error("Asiento no encontrado");

      if (seat.reserved) {
        throw new Error("Asiento ya reservado");
      }

      // Check if seat is temporarily reserved
      if (this.tempReservedSeats.has(`${eventId}-${seatNumber}`)) {
        throw new Error("Asiento está siendo seleccionado por otro usuario");
      }

      // Temporarily reserve the seat
      this.tempReservedSeats.set(`${eventId}-${seatNumber}`, {
        userId,
        timestamp: Date.now()
      });

      // Emit to all clients that this seat is being selected
      this.io.to(eventId).emit('seatSelecting', { 
        eventId, 
        seatNumber, 
        userId, 
        userName 
      });

      // Set a timeout to release the temporary reservation
      setTimeout(() => {
        this.tempReservedSeats.delete(`${eventId}-${seatNumber}`);
        this.io.to(eventId).emit('seatSelectingCancelled', { 
          eventId, 
          seatNumber 
        });
      }, 30000); // 30 seconds timeout

      return { eventId, seatNumber };
    } catch (error) {
      throw error;
    }
  }

  async confirmSeatReservation(eventId, seatNumber, userId, userName) {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw new Error("Evento no encontrado");

      const seat = event.seats.find(s => s.seatNumber === seatNumber);
      if (!seat) throw new Error("Asiento no encontrado");

      if (seat.reserved) {
        throw new Error("Asiento ya reservado");
      }

      // Remove temporary reservation
      this.tempReservedSeats.delete(`${eventId}-${seatNumber}`);

      // Update seat in database
      seat.reserved = true;
      seat.reservedBy = userName;
      await event.save();

      // Emit to all clients that seat is now reserved
      this.io.to(eventId).emit('seatReserved', { 
        eventId, 
        seatNumber, 
        userId, 
        userName 
      });

      return { eventId, seatNumber, userName };
    } catch (error) {
      throw error;
    }
  }

  setupSocketEvents(socket) {
    socket.on('joinEvent', (eventId) => {
      socket.join(eventId);
    });

    socket.on('selectSeat', async (data) => {
      try {
        const result = await this.reserveSeat(
          data.eventId, 
          data.seatNumber, 
          data.userId, 
          data.userName
        );
        socket.emit('selectSeatSuccess', result);
      } catch (error) {
        socket.emit('selectSeatError', { 
          message: error.message 
        });
      }
    });

    socket.on('confirmSeat', async (data) => {
      try {
        const result = await this.confirmSeatReservation(
          data.eventId, 
          data.seatNumber, 
          data.userId, 
          data.userName
        );
        socket.emit('confirmSeatSuccess', result);
      } catch (error) {
        socket.emit('confirmSeatError', { 
          message: error.message 
        });
      }
    });
  }
}

module.exports = SeatManager;