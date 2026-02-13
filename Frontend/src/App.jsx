import { useEffect, useState } from "react";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ChatLayout from "./assets/Components/chat/ChatLayout";
import LoginUser from "./assets/Components/LoginUser.jsx";
import RegisterUser from "./assets/Components/RegisterUser.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/chat" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/chat" replace />
            ) : (
              <LoginUser setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* Register */}
        <Route path="/register" element={<RegisterUser />} />

        {/* Chat (Protected Route) */}
        <Route
          path="/chat"
          element={
            isLoggedIn ? <ChatLayout /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
