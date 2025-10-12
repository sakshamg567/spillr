import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfileCard from "./ProfileCard";
import { useNavigate } from "react-router-dom";
import Feedback from "./Feedback";
import Footer from './Footer'
export default function Navbar() {
  const { user, logout, setAuthMode } = useAuth();
  const [activeItem, setActiveItem] = useState(!!user ? "Messages" : "Register");
  const navigate = useNavigate();

  const getNavItems = (isLoggedIn) => {
    const baseItems = [];

    if (isLoggedIn) {
      return [
        ...baseItems,
        { label: "Messages", onClick: () => setActiveItem("Messages"), href: "#messages" },
        { label: "Settings", onClick: () => navigate("/settings"), href: "#settings" },
        { label: "Logout", onClick: logout, href: "#logout" },
      ];
    } else {
      return [
        ...baseItems,
        { label: "Register", onClick: () => setAuthMode("register"), href: "#register" },
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
    <div>
      {/* Fixed Navbar */}
      <header
        className="fixed top-0 left-0 w-full z-50 shadow-lg
                   bg-white-10 backdrop-blur-md
                   border-b border-white/10 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="font-['Fasthin',cursive] text-3xl md:text-4xl text-black tracking-wide transition-opacity duration-500">
              Spillr<span className="text-blue-300"></span>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-2">
              {items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => handleItemClick(item)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${activeItem === item.label
                      ? "bg-white/20 text-gray-600 shadow-inner"
                      : "text-black hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Push content below fixed header */}
      <div className="pt-20">
        <ProfileCard />
      </div>

      <Feedback />

      <div>
        <Footer />
      </div>
    </div>
  );
}
