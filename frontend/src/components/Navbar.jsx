import { faCar, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getRoles, logout } from "../api/auth";

const Navbar = () => {
  const isAdmin = getRoles().includes("admin");

  return (
    <nav className="fixed top-0 left-0 w-full p-2 z-50 bg-blue-500 drop-shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="text-xl font-bold">
          <FontAwesomeIcon icon={faCar}/> CarX
        </div>
        <div>
          {isAdmin && (
            <button
              onClick={() => window.location.href = "/settings"}
              className="mr-4 px-4 py-2 font-bold rounded-lg hover:bg-blue-600"
            >
              <FontAwesomeIcon icon={faGear} /> Ustawienia
            </button>
          )}
          <button onClick={logout} className="px-4 py-2 font-bold rounded-lg hover:bg-blue-600">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
