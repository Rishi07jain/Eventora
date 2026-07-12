import Event from '../models/Event.js';

export const getAllEvents = async (req,res) => {
    try{

        const filters = {};
        if(req.query.category){
            filters.category = req.query.category  // means if in the request to get all events , i
        }
        if (req.query.search){
            filters.title = { $regex: req.query.search, $options: 'i' };
        }

        const events = await Event.find(filters).populate('createdBy', 'name email');
        res.json(events);
    }
    catch(error){
        res.status(500).json({error : error.message})
    }
}

export const getEventById = async (req , res) => {
    try{
        const event = await Event.findById(req.params.id)   // note , findById is a mongoDB function , not our custom made function. To know about more such functions , watch video of this channel only in 'MERN Stack Complete course' playlist
        if(!event){
            return res.status(404).json({error: 'Event not found'})
        }
        res.json(event);
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
}

export const createEvent = async (req, res) => {
    try {
        // 🟩 Add this debug line here:
        console.log("➡️ INCOMING REQ.BODY IS:", req.body);

        const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            imageUrl: imageUrl || '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        // req.params.id tells mongoose which id to updare , req.body contains the new data to update to received from the frontend 
        // MongoDB applies your changes to the database but returns the old, original document back to your code.
        // By setting { new: true }, you explicitly force Mongoose to return the freshly updated document instead.
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};