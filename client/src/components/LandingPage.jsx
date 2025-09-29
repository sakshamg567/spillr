import React,{ useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import Navbar from "./Navbar";
import { ArrowRight } from "lucide-react";
import RegisterForm from "./auth/RegisterForm";
import Footer from "./Footer";
import pastel from "../assets/pastel.jpeg";
import LoginForm from "./auth/LoginForm";
import { useNavigate, useSearchParams } from "react-router-dom";

import Loading from './Loading'
const LandingPage = () => {
  const { loading, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
   
  
if (loading) {
    return <Loading />;
  }
 
const { setAuthMode, authMode } = useAuth();

  const handleCloseModal = () => setAuthMode(null);
  const handleRegisterSuccess = () => {
    setAuthMode(null);
    navigate("/dashboard", { replace: true });
  };
  const handleLoginSuccess = () => {
    setAuthMode(null);
    navigate("/dashboard", { replace: true });
  };

  
  return (
    <div
      className="min-h-screen bg-cover bg-center "
      style={{
        backgroundImage: `url(${pastel})`,
      }}
    >
   
      <header className="flex items-center justify-between px-6 pt-2 pb-2">
        <h2 className="font-['Fasthin',cursive] text-3xl md:text-4xl text-black tracking-wide pl-6">
          Spillr
        </h2>
        <Navbar />
      </header>
<main className="relative flex w-full  h-auto md:h-120 items-start md:items-center pt-6 pl-8">

  <div className="absolute inset-0 flex w-full h-full">
    {/* Top Border Left */}
    <div className="flex-grow relative">
      <div className="absolute top-0 left-0 w-full border-t-2 border-black"></div>
    </div>
    {/* Decorative Arc */}
   <div className="relative w-[120px] h-[90px] md:w-[160px] md:h-[160px]">
      <div className="absolute top-0 right-- w-full h-full rounded-tr-full border-t-2 border-r-2 border-black "></div>
    </div>
  </div>

 <div className="relative z-10 flex flex-col max-w-2xl mt-0">
  <h1 className="m-0 text-5xl md:hidden font-black text-foreground leading-tight tracking-tight poster-text pt-2 px-4">
  ASK<br />ANONYMOUSLY,<br />ANSWER<br />OPENLY.
</h1>

<h1 className="hidden md:block text-6xl lg:text-7xl font-black text-foreground leading-none tracking-tight text-balance poster-text pt-10 px-6">
  ASK <br />
  ANONYMOUSLY, <br />
  ANSWER <br />
  OPENLY.
</h1>



    <p className=" text-lg text-gray-600 pt-4 pl-6">
      Share openly or anonymously, whatever feels right. <br />
      Get real, anonymous insights from your audience. <br />
      Perfect for creators, professionals, <br />
      and anyone seeking genuine feedback.
      
    </p>

    <button
      onClick={() => setAuthMode("register")}
      className="mt-8 gradient-primary flex items-center gap-2 px-6 py-3 rounded-xl text-black text-xl font-semibold shadow-glow hover:shadow-elegant hover:scale-105 active:scale-95 transition-all duration-200 group"
    >
      <span className="tracking-tight">Get Started </span>
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </button>

    
  </div>
  
</main>
<section className="max-w-6xl mx-auto py-16 md:py-24 px-4">

  <div className="w-full border-t-2 border-black mb-8"></div>

 
  <div className="text-center mb-12">
    <h2 className="text-4xl font-black text-foreground pt-6">How it works</h2>
  </div>


  <div className="flex flex-col gap-12">
    
    <div className="flex flex-row items-start gap-6">
      <div className="flex-shrink-0 w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center font-black text-xl">
        1
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground">Create Your Profile</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Set up your Spillr profile and get your unique link to share with friends, colleagues, or anyone you trust.
        </p>
      </div>
    </div>


    <div className="flex flex-row items-start gap-6">
      <div className="flex-shrink-0 w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center font-black text-xl">
        2
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground">Share Your Link</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Send your Spillr link to people whose opinions matter to you. They can send you anonymous messages.
        </p>
      </div>
    </div>

  
    <div className="flex flex-row items-start gap-6">
      <div className="flex-shrink-0 w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center font-black text-xl">
        3
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground">Receive & Grow</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Get honest feedback, reply to messages, and start meaningful conversations that help you grow.
        </p>
      </div>
    </div>
  </div>
</section>
<div  className="max-w-6xl mx-auto py-16 md:py-24 px-4">
 <div className="w-full border-t-2 border-black mb-8"></div></div>
      
      <Footer />
   
      {authMode === "login" && (
        <div className="fixed inset-0 bg-white-40 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onCancel={handleCloseModal}
              onToggleRegister={() => setAuthMode("register")}
            />
          </div>
        </div>
      )}

    
      {authMode === "register" && (
        <div className="fixed inset-0 bg-white-40 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onCancel={handleCloseModal}
              onToggleLogin={() => setAuthMode("login")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
