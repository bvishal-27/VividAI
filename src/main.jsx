import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <>
                <SignedIn><Navigate to="/chat" replace /></SignedIn>
                <SignedOut><LandingPage /></SignedOut>
              </>
            } />
            <Route path="/chat" element={
              <>
                <SignedIn><App /></SignedIn>
                <SignedOut><Navigate to="/" replace /></SignedOut>
              </>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
);