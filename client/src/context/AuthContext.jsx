// Instead of forcing you to pass user data manually down through every single component via props, this file creates a global
//  broadcast system (AuthContext). It securely tracks whether a user is logged in, manages their security tokens in the 
// browser, and shares authentication actions (like login, register, and logout) with every single page in your application instantly.

import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => { // children: This represents your actual website pages (like the Home page, Login page, etc.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
// When a user logs into your website, they get a digital ID badge. But if they close the browser tab or hit Refresh, React completely resets its memory. Without this piece of code, the user would be kicked out and forced to log in again every single time they refresh the page!
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');  // This line tells the Security Manager: "Look inside the notebook and see if we have a record filed under the name 'userInfo'."
        if (userInfo) {   // if (userInfo): If the manager finds a saved file, it means this user logged in successfully earlier!
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });  // The frontend knocks on your backend's door (/auth/login) and hands over the typed email and password to verify.
            setUser(data);   // If the credentials are correct, the backend sends back the user's profile data. This line saves that data directly into React's active memory so your website instantly knows who is logged in.
            localStorage.setItem('userInfo', JSON.stringify(data));  // JSON.stringify converts the user's data object into a flat string and writes it in the browser's permanent notebook. This keeps them logged in even if they refresh the tab.
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            if (error.response?.data?.needsVerification) throw error.response.data; // basically it is a nested if else only , but using ternary operator.
// Step 1: error This is the base object caught by your catch block. It contains information about what went wrong with the API request.
// Step 2: ?.response JavaScript asks: "Does the error object contain a property named response?"  If yes, it moves to the next step.
//     If no (e.g., the server was completely down and didn't respond at all), it stops running immediately and returns undefined, preventing a crash.
// Step 3: ?.data JavaScript asks: "Does the response object contain a payload body named data?"
//     If yes, it digs deeper.
//     If no, it stops and safely returns undefined.
// Step 4: ?.needsVerification Finally, it looks for your custom boolean flag inside the backend data payload to check if it's true or false.
            
throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            return data; // Returns { message, email }
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'OTP verification failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        // Any React component you place inside this Provider wrapper now has instant access to everything listed in that value bundle.
        <AuthContext.Provider value={{ user, login, register, verifyOTP, logout, loading }}>  
            {!loading && children}   {/* "If loading is false, only then render the children (the rest of your app)." */}
        </AuthContext.Provider>
    );
};