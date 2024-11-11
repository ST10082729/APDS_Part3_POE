import React from "react";
import ReactDOM from "react-dom/client"; // Import createRoot from ReactDOM
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import App from "./App";
import './index.css';
import reportWebVitals from './reportWebVitals'; // Import reportWebVitals

const root = ReactDOM.createRoot(document.getElementById("root")); // Use createRoot
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Optional: If you want to start measuring performance in your app
reportWebVitals();