import Booking from '../models/Bookings.js';
import Event from '../models/Event.js';
import OTP from '../models/OTP.js';
import { sendBookingEmail, sendOtpEmail } from '../utils/email.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' }); // Queries the database using your OTP model to find and permanently delete any older, unexpired booking OTP tokens tied to this logged-in user's email
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
        await sendOtpEmail(req.user.email, otp, 'event_booking');
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

export const bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteOne({ _id: validOTP._id }); // cleanup

        res.status(201).json({ message: 'Booking request submitted', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body; // 'paid' or 'not_paid'
    //    ^^ JavaScript reads that line as a set of exact instructions:
    // "Go look inside the req.body object."
    // "Find the specific key named exactly paymentStatus."
    // "Take its value ("paid"), create a brand new local variable named paymentStatus, and assign the value to it."

        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');  // When Mongoose executes that query statement, it goes into MongoDB, finds the specific record that matches the ID, merges the populated data fields into it, and hands it back to your code as a single, neat wrapper. Because it returns an object, you can immediately access all of its internal properties using standard dot notation.

        // Without .populate(), a booking record inside MongoDB only stores useless, raw ID strings like "60004230122" to represent the user and the event. If your backend needs to send an email or print the event's title, it has no idea what those random numbers mean. Chaining .populate() tells Mongoose to automatically jump over to your other database collections, look up the real files matching those IDs, and inject their full details (like name, email, and event title) directly into the result. It instantly swaps out a dead ID pointer with a live, fully detailed data object.
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });

        const event = await Event.findById(booking.eventId._id);
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();

        event.availableSeats -= 1;
        await event.save();

        // Send email on admin confirmation
        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
            // If the condition is true (the user is an admin), the code executes the query after the ? to fetch all bookings across the 
            // entire platform. If the condition is false (the user is a regular customer), it executes the query after the : to filter the database and return only their personal bookings matching their specific ID.

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';  // Yes, exactly! wasConfirmed is a pure boolean variable, meaning its value can only be true or false. If booking.status is exactly equal to confirmed , then wasConfirmed stores true , else false

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};