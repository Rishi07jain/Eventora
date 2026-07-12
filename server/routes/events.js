import express from 'express'

const router = express.Router()

import {protect , admin} from '../middleware/auth.js'

import {getAllEvents , getEventById , createEvent , updateEvent , deleteEvent} from '../controllers/eventController.js'
// To get all events

// Incase of only / , we fetch all the events
router.get('/', getAllEvents);

// To get an event by its id
router.get('/:id' , getEventById);

// Create Event (admin only can do)
router.post('/' , protect , admin , createEvent);

// Update event (admin only can do)
router.put('/:id' , protect , admin , updateEvent);

// Delete event (admin only can do)
router.delete('/:id', protect , admin , deleteEvent)

export default router;

// Now all these functions ie getAllEvents , getEventById , createEvent etc , their logics will be written inside the 
// eventController.js file
// This is same as auth.js routes file , whose logics were written in authController 
// Note : these controller files are the main brain of the backend