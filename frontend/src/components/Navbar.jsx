import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Interview" },
    { path: "/reports", label: "Reports" },
    { path: "/videos", label: "Videos" },
  ];

  return (
    <nav className="bg-gray-900 text-white px-8 py-3 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div className="text-xl font-extrabold tracking-wide flex items-center space-x-2">
        <span>🎥</span>
        <span>Video Proctoring</span>
      </div>

      {/* Links */}
      <div className="flex space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`relative font-medium transition 
              ${
                location.pathname === link.path
                  ? "text-purple-400 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-purple-400"
                  : "hover:text-purple-300"
              }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
