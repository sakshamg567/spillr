import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function GlassNavbar() {
  const { user, logout, setAuthMode } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItem, setActiveItem] = useState("Home");
  const navRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

  const items = [
    { label: "Home", onClick: () => setActiveItem("Home") },
    !user
      ? { label: "Register", onClick: () => setAuthMode("register") }
      : { label: "Logout", onClick: logout },
    !user
      ? { label: "Login", onClick: () => setAuthMode("login") }
      : null,
  ].filter(Boolean);

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
  }, [activeItem]);

  return (
    <nav className="relative flex items-center justify-center p-1 bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-full">
      <div className="relative flex items-center gap-2">
        {/* Active pill indicator */}
        <div
          className="absolute h-8 bg-white/20 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{
            width: indicatorStyle.width,
            left: indicatorStyle.left,
          }}
        />

        {/* Nav items */}
        {items.map((item) => (
          <button
            key={item.label}
            ref={(el) => (navRefs.current[item.label] = el)}
            onClick={() => {
              item.onClick();
              setActiveItem(item.label);
            }}
            onMouseEnter={() => updateIndicator(item.label)}
            onMouseLeave={() => updateIndicator(activeItem)}
            className={`relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full min-w-[5rem] text-center ${
              activeItem === item.label
                ? "text-gray-600"
                : "text-black hover:text-gray-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
