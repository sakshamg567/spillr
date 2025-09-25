import React, { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);


  const handleLoginClick = () => {
    console.log("Login clicked");
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleRegisterClick = () => {
    console.log("Register clicked");
    setShowRegister(true);
    setShowLogin(false);
  };

  const handleCloseModal = () => {
    console.log("Modal closed");
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <>
      <nav className="flex items-center md:space-x-2 text-base font-normal md:pr-6 space-x-2 pr-28 gap-2 md:pr-54">
        <a href="/home" className="hover:text-gray-500">Home</a>
        

        <div className="flex-grow"></div>

        {!user && (
          <>
            <span
              className="cursor-pointer hover:text-gray-500 select-none md:block"
              onClick={handleRegisterClick}
            >
              Register
            </span>
            <span
              className="cursor-pointer hover:text-gray-500 select-none"
              onClick={handleLoginClick}
            >
              Login
            </span>
          </>
        )}

        {user && (
          <span
            className="cursor-pointer hover:text-red-600 select-none"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </span>
        )}
      </nav>

      {(showLogin || showRegister) && (
        <div 
          className="fixed inset-0 bg-white-40 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={handleCloseModal}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div 
            className="bg-white border border-gray-200 p-6 rounded-xl shadow-2xl relative w-full max-w-md mx-4"
            onClick={(e) => {
              console.log("Modal content clicked");
              e.stopPropagation(); 
            }}
          >
         
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center"
              onClick={(e) => {
                console.log("Close button clicked");
                e.stopPropagation();
                handleCloseModal();
              }}
            >
              ×
            </button>

           

           
            {showLogin && (
              <div>
               
                <LoginForm
                  onSuccess={() => {
                    console.log("Login success");
                    setShowLogin(false);
                  }}
                  onToggleRegister={() => {
                    console.log("Toggle to register");
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                  onCancel={() => {
                    console.log("Login cancelled");
                    setShowLogin(false);
                  }}
                />
              </div>
            )}

            
            {showRegister && (
              <div>
                
                <RegisterForm
                  onSuccess={() => {
                    console.log("Register success");
                    setShowRegister(false);
                  }}
                  onToggleLogin={() => {
                    console.log("Toggle to login");
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                  onCancel={() => {
                    console.log("Register cancelled");
                    setShowRegister(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;