const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  const { title, description, date, time, location, availableSeats } = req.body;

  try {
    const image = req.file ? req.file.path : null;

    // Generar butacas dinámicamente
    const seats = Array.from({length: availableSeats}, (_, i) => ({
      seatNumber: `Seat ${i + 1}`,
      reserved: false,
      reservedBy: null,
      selecting: false,
      selectingBy: null
    }));

    const newEvent = new Event({ 
      title, 
      description, 
      date, 
      time, 
      location, 
      image, 
      seats 
    });
    await newEvent.save();

    res.status(201).json({ message: "Evento creado exitosamente.", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el evento.", error: error.message });
  }
};


exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los eventos.", error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Evento no encontrado." });

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el evento.", error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, availableSeats } = req.body;
    const image = req.file ? req.file.path : undefined;

    const updatedFields = { title, description, date, time, location, availableSeats };
    if (image) updatedFields.image = image;

    const event = await Event.findByIdAndUpdate(req.params.id, updatedFields, { new: true, runValidators: true });
    // actualizar esto tambien los asientos
    
    if (!event) return res.status(404).json({ message: "Evento no encontrado." });

    res.status(200).json({ message: "Evento actualizado exitosamente.", event });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el evento.", error: error.message });
  }
};


exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Evento no encontrado." });

    res.status(200).json({ message: "Evento eliminado exitosamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el evento.", error: error.message });
  }
};

// comentarios del evento
exports.addComment = async (req, res) => {
  try {
    const { user, message } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Evento no encontrado." });

    event.comments.push({ user, message });
    await event.save();

    res.status(201).json({ message: "Comentario agregado exitosamente.", event });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar el comentario.", error: error.message });
  }
};

exports.reserveSeat = async (req, res) => {
  try {
    const { seatNumber } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Evento no encontrado." });

    const seat = event.seats.find(s => s.seatNumber === seatNumber);
    if (!seat) return res.status(404).json({ message: "Butaca no encontrada." });

    if (seat.reserved) {
      return res.status(400).json({ message: "Butaca ya reservada." });
    }

    seat.reserved = true;
    seat.reservedBy = req.user.name; // Assuming user info is attached to req via middleware

    await event.save();

    res.status(200).json({ message: "Butaca reservada exitosamente.", event });
  } catch (error) {
    res.status(500).json({ message: "Error al reservar la butaca.", error: error.message });
  }
};