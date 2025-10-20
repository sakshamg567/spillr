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
    !user ? { label: "Login", onClick: () => setAuthMode("login") } : null,
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
    <nav className="relative flex items-center justify-center p-2 bg-white border border-black shadow-[6px_6px_0_0_#000]">
      <div className="relative flex items-center gap-2">
        {/* Active pill indicator */}
        <div
          className="absolute bottom-0 h-[4px] bg-black transition-all duration-700 ease-out"
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
            style={{ fontFamily: "Space Grotesk" }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
