import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import PhotoForm from "./components/PhotoForm";
import PhotoList from "./components/PhotoList";
import Homepage from "./Homepage";
import { getToken } from "./api/auth";

function App() {
  const [refresh, setRefresh] = useState(false);

  const triggerRefresh = () => setRefresh(!refresh);
  const isAuthenticated = () => !!getToken();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/app" element={isAuthenticated() ? (
          <div>
            <Navbar />
            <main className="flex items-center justify-center min-h-screen px-4">
              <div className="flex flex-col items-center gap-6 w-full max-w-xl mt-16">
                <div className="bg-white border border-blue-500 rounded-lg shadow-md p-6 w-full max-w-xl">
                  <PhotoForm onUpload={triggerRefresh} />
                </div>
                <div className="bg-white border border-blue-500 rounded-lg shadow-md p-6 w-full max-w-xl">
                  <PhotoList refreshTrigger={refresh} />
                </div>
              </div>
            </main>
          </div>
        ) : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
