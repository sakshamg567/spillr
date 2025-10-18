import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Feedback from "./Feedback";
import Footer from "./Footer";

export default function Navbar() {
  const { user, logout, setAuthMode } = useAuth();
  const [activeItem, setActiveItem] = useState(user ? "Messages" : "Register");
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const navRefs = useRef({});
  const navigate = useNavigate();

  const updateIndicator = (label) => {
    const el = navRefs.current[label];
    if (el) {
      setIndicatorStyle({
        width: el.offsetWidth,
        left: el.offsetLeft,
      });
    }
  };

  useEffect(() => {
    updateIndicator(activeItem);
  }, [activeItem, user]);

  const getNavItems = (isLoggedIn) => {
    if (isLoggedIn) {
      return [
        { label: "Messages", onClick: () => setActiveItem("Messages"), href: "#messages" },
        { label: "Settings", onClick: () => navigate("/settings"), href: "#settings" },
        { label: "Logout", onClick: logout, href: "#logout" },
      ];
    } else {
      return [
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
    <div style={{ fontFamily: "Space Grotesk" }}>
      <header className="fixed top-0 left-0 right-0 flex items-center bg-yellow-200 border-b border-black h-16 z-50">
        <div className="w-full flex justify-between items-center px-4">
          <div className="font-['Fasthin',cursive] text-3xl md:text-4xl text-black tracking-wide">
            Spillr
          </div>

          {/* Navigation */}
          <nav className="relative flex items-center gap-4">
           
            <div
              className="absolute bottom-0 h-[4px] bg-black transition-all duration-700 ease-out"
              style={{
                width: indicatorStyle.width,
                left: indicatorStyle.left,
              }}
            />

            {items.map((item) => (
              <a
                key={item.label}
                ref={(el) => (navRefs.current[item.label] = el)}
                href={item.href}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => updateIndicator(item.label)}
                onMouseLeave={() => updateIndicator(activeItem)}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeItem === item.label
                    ? "text-gray-700"
                    : "text-black hover:text-gray-800"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Push content below fixed header */}
      <div className="pt-20">
        <Feedback />
      </div>

      <Footer />
    </div>
  );
}
