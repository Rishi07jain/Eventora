// this axios file will connect us with the backend

import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',   // baseURL: Sets up your backend base server address. Because this is locked in here, when you write code later to fetch events, you don't have to type http://localhost:8080/api/events. You can simply write api.get('/events'), and Axios will stitch the URLs together automatically.
    headers:{
        'Content-Type': 'application/json'  // in backend , we used express.json() , ie backend will handle everything in json format. So this line is frontend's way of saying we will send everything in json format. you are telling the backend server: "Hey, the data inside this request is formatted in JSON language." When the server reads this label, it immediately knows to hand the package over to your express.json() middleware, which unlocks it and reads it perfectly. Without this label, the backend wouldn't know how to open or read the incoming data.
    },
});


// This code block sets up an Interceptor in Axios. Think of an interceptor as a checkpoint guard standing at the exit gate of your frontend application. Right before any API request leaves your browser and travels across the internet to your backend server, this interceptor steps in, pauses the request for a split second, and processes it.
api.interceptors.request.use((config)=>{
    const token = localStorage.getItem('token');   // What it means: It takes a quick peek into your browser's Local Storage to check if there is a security string named 'token' saved there. 
    if(token){  // If it finds a token, it slips your JSON Web Token (JWT) into the request's structural header pocket under the key name Authorization. The prefix Bearer  is just the standard formatting rule for web tokens.
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;  // Finally, it hands the updated request back to Axios so it can leave the browser and fly to your backend server.
})

export default api;