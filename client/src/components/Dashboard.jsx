import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfileCard from "./ProfileCard";
import { useNavigate } from "react-router-dom";
import Feedback from "./Feedback";
import Footer from "./Footer";
export default function Navbar() {
  const { user, logout, setAuthMode } = useAuth();
  const [activeItem, setActiveItem] = useState(
    !!user ? "Messages" : "Register"
  );
  const navigate = useNavigate();

  const getNavItems = (isLoggedIn) => {
    const baseItems = [];

    if (isLoggedIn) {
      return [
        ...baseItems,
        {
          label: "Messages",
          onClick: () => setActiveItem("Messages"),
          href: "#messages",
        },
        {
          label: "Settings",
          onClick: () => navigate("/settings"),
          href: "#settings",
        },
        { label: "Logout", onClick: logout, href: "#logout" },
      ];
    } else {
      return [
        ...baseItems,
        {
          label: "Register",
          onClick: () => setAuthMode("register"),
          href: "#register",
        },
        { label: "Login", onClick: () => setAuthMode("login"), href: "#login" },
      ];
    }
  };

  const items = getNavItems(!!user);

  const handleItemClick = (item) => {
    item.onClick();
    setActiveItem(item.label);
  };

  return (
    <div style={{ fontFamily: "Space Grotesk" }}>
      <header className="fixed top-0 left-0 right-0 flex items-center bg-yellow-200 border-b border-black h-16 z-50">
        <div className="w-full flex justify-between items-center px-4">
          <div className="font-['Fasthin',cursive] text-3xl md:text-4xl text-black tracking-wide">
            Spillr
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => handleItemClick(item)}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${
                      activeItem === item.label
                        ? "bg-white/20 text-gray-600 shadow-inner"
                        : "text-black hover:bg-gray-100 hover:text-gray-900"
                    }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Push content below fixed header */}
      <div className="pt-20 flex items-center justify-center">
   
      <Feedback />
      </div>


      <div>
        <Footer />
      </div>
    </div>
  );
}
