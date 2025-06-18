import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "./api/auth";
import keycloak from "./api/auth";

export default function Homepage() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (getToken()) {
      setLoggedIn(true);
      navigate("/app");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Discover cars with CarX</h1>
      <p className="text-lg mb-6">Log in to upload and view your car photos!</p>

      {loggedIn ? (
        <button
          onClick={() => navigate("/app")}
          className="bg-white text-blue-600 font-bold px-6 py-2 rounded hover:bg-gray-200 transition"
        >
          Enter App
        </button>
      ) : (
        <>
          <button
            onClick={() => keycloak.login()}
            className="bg-white text-blue-600 font-bold px-6 py-2 rounded hover:bg-gray-200 transition"
          >
            Sign In
          </button>
          <button
            onClick={() => keycloak.register()}
            className="bg-white text-green-600 font-bold px-6 py-2 rounded hover:bg-gray-200 transition mt-4"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}
