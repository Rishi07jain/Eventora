# Eventora 

> A secure, full-stack event management and ticketing platform equipped with role-based access control, two-factor OTP verification, smart overbooking prevention, and real-time administrative analytics.

---

##  Features

###  User Authentication & Security
* **Secure Auth:** Robust login & registration powered by JWT (JSON Web Tokens) and bcrypt password hashing.
* **Two-Factor Authentication (2FA) OTP:**
  * Mandatory Email OTP verification to activate accounts upon registration (and for suspicious login attempts).
  * Mandatory Email OTP authorization step required to finalize and secure event ticket bookings.

###  Role-Based Access Control (RBAC)
* **Admin Capabilities:**
  * Create, edit, and delete events.
  * Review, confirm, or reject incoming booking requests.
  * Update booking payment statuses (`Paid` / `Not Paid`).
  * Strict administrative access locked exclusively to database-flagged admin users.
* **User Capabilities:**
  * Browse available public events.
  * Submit ticket booking requests protected by 2FA OTP.
  * Track personal booking status and dashboard updates in real time.
  * Cancel active or pending bookings.

###  Event Management
* Create and manage both **free** and **paid** events.
* Rich event details including external image URLs, timestamps, custom categories, and strict seating capacities.

###  Smart Booking & Validation System
* Mandatory 2FA OTP prompt to authorize every booking transaction.
* All new booking requests (free and paid) enter a secure **'Pending'** queue awaiting admin verification.
* Dynamic seat availability tracking with robust validation logic to completely prevent overbooking.

###  Admin Analytics Dashboard
* Live operational data monitoring directly from the admin panel.
* Real-time tracking of:
  * Pending Requests Queue
  * Total Revenue Generated
  * Total Confirmed & Paid Clients

###  Automated Notifications
* Seamless transactional email delivery upon successful booking confirmation powered by Nodemailer.

### 🎨 Sleek UI/UX
* Modern, responsive interface built with **React** and **Tailwind CSS**.
* Enhanced with clean layouts and smooth micro-interactions.
