import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; 
import ProfileCard from "./ProfileCard";
import { useNavigate } from "react-router-dom";
import Feedback from "./Feedback";


export default function Navbar() {
  const { user, logout, setAuthMode } = useAuth(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(!!user ? "Messages" : "Register"); 
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
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
    setIsMenuOpen(false); 
  };

  return (
    <div >
    <header className="fixed top-0 w-full z-50 shadow-lg 
                       bg-gray-800/50 backdrop-blur-md 
                       border-b border-white/10 transition-all duration-300 ">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 text-white font-extrabold text-xl tracking-wider">
            Spillr<span className="text-blue-300"></span>
          </div>
          <nav className="hidden md:flex space-x-2">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => handleItemClick(item)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                            ${activeItem === item.label
                              ? "bg-white/20 text-white shadow-inner"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md 
                         text-gray-300 hover:text-white hover:bg-white/10 
                         focus:outline-none focus:ring-2 focus:ring-white transition-colors"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
  
              <svg className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              <svg className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>

 
      <div 
        id="mobile-menu"
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden 
                     bg-gray-900/80 backdrop-blur-lg 
                     border-t border-white/10 pt-2 pb-3 shadow-xl`}
      >
        <div className="space-y-1 px-2">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => handleItemClick(item)}
              className={`block px-3 py-2 rounded-md text-base font-medium 
                          ${activeItem === item.label
                            ? "bg-white/20 text-white shadow-inner"
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </header>
   <div className="pt-20">
  <ProfileCard />
</div>

<Feedback />

    </div>
  );
}