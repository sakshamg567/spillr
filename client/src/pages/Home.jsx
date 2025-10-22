import { useState, useEffect, lazy, Suspense, memo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Shield, Zap, MessageCircle } from "lucide-react";

const LoadingSpinner = lazy(() => import("../components/Loading"));
const Navbar = lazy(() => import("../components/Navbar"));
const LoginForm = lazy(() => import("../components/auth/LoginForm"));
const RegisterForm = lazy(() => import("../components/auth/RegisterForm"));
const Footer = lazy(() => import("../components/Footer"));

const QuickLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-transparent ">
    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
  </div>
);

const Modal = memo(({ children, onClose }) => {
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-auto modal-overlay"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-6 bg-white/10 rounded-lg shadow-lg backdrop-blur-sm border border-white/20"
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[200px]">
              <QuickLoader />
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

const FeatureCard = memo(
  ({ icon: Icon, title, description, delay = 0, bgColor = "bg-white" }) => (
    <div
      className={`flex flex-col ${bgColor} p-6 shadow-card shadow-[6px_6px_0_0_#000] transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg`}
      style={{
        fontFamily: "Space Grotesk",
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="gradient-primary p-3 rounded-xl w-fit mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground flex-grow">{description}</p>
    </div>
  )
);

FeatureCard.displayName = "FeatureCard";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hideTitle, setHideTitle] = useState(false);
  const { loading, authMode, setAuthMode, user, logout, isAuthenticated } =
    useAuth();

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    const handleScroll = () => setHideTitle(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    import("../components/auth/LoginForm");
    import("../components/auth/RegisterForm");
  }, []);

  if (loading) {
    return (
      <Suspense fallback={<QuickLoader />}>
        <LoadingSpinner />
      </Suspense>
    );
  }

  const handleCloseModal = () => setAuthMode(null);

  const handleRegisterSuccess = () => {
    setAuthMode(null);
    setTimeout(() => navigate("/dashboard", { replace: true }), 100);
  };

  const handleLoginSuccess = () => {
    setAuthMode(null);
    setTimeout(() => navigate("/dashboard", { replace: true }), 100);
  };

  return (
    <div className="min-h-screen">
      <main>
        <div className="min-h-screen w-full relative">
          {/* Dashed Top Fade Grid */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 0",
              maskImage: `
        repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
      `,
              WebkitMaskImage: `
 repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
      `,
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          />

          <div className="relative z-10">
            <section className="flex items-center justify-center min-h-screen">
              {/* Header */}
              <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4">
                {!hideTitle && (
                  <h2 className="font-['Fasthin',cursive] text-xl md:text-4xl text-black tracking-wide pt-2 md:pr-0 transition-opacity duration-500">
                    Spillr
                  </h2>
                )}
                <div className="absolute left-1/2 transform -translate-x-1/2 pt-2 pl-12 md:pl-4">
                  <Suspense
                    fallback={
                      <div className="w-32 h-10 bg-gray-200 animate-pulse" />
                    }
                  >
                    <Navbar />
                  </Suspense>
                </div>
              </header>

              {/* Modals */}
              {authMode === "login" && (
                <Modal onClose={handleCloseModal}>
                  <LoginForm
                    onSuccess={handleLoginSuccess}
                    onToggleRegister={() => setAuthMode("register")}
                    onCancel={handleCloseModal}
                  />
                </Modal>
              )}

              {authMode === "register" && (
                <Modal onClose={handleCloseModal}>
                  <RegisterForm
                    onSuccess={handleRegisterSuccess}
                    onToggleLogin={() => setAuthMode("login")}
                    onCancel={handleCloseModal}
                  />
                </Modal>
              )}

              <div className="flex flex-col items-center justify-center max-w-2xl text-center px-4">
                {/* Mobile Heading */}
                <h1
                  className="m-0 text-5xl md:hidden leading-tight tracking-tight text-balance poster-text animate-fade-in"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  ASK
                  <br />
                  ANONYMOUSLY,
                  <br />
                  ANSWER
                  <br />
                  OPENLY.
                </h1>

                {/* Desktop Heading */}
                <h1
                  className="hidden md:block text-6xl lg:text-7xl text-black leading-none tracking-tight text-balance poster-text animate-fade-in"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  ASK <br />
                  ANONYMOUSLY, <br />
                  ANSWER <br />
                  OPENLY.
                </h1>

                <p
                  className="text-lg text-gray-800 mt-6 animate-fade-in-delayed"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Share openly or anonymously, whatever feels right. <br />
                  Get real, anonymous insights from your audience. <br />
                  Perfect for creators, professionals, <br />
                  and anyone seeking genuine feedback.
                </p>

                {user ? (
                  <button
                    onClick={logout}
                    className="mt-8 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:-translate-y-[2px] active:translate-y-[2px] transition-transform text-lg animate-fade-in-delayed"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthMode("register")}
                    className="mt-8 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:-translate-y-[2px] active:translate-y-[2px] transition-transform text-lg font-medium animate-fade-in-delayed"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight className="inline-block ml-2 h-5 w-5" />
                  </button>
                )}
              </div>
            </section>
          </div>

          <div className="w-full px-6 py-12 flex items-center justify-center bg-yellow-200 border border-4">
            <div className="w-full max-w-6xl space-y-8">
              <div className="text-center mb-12">
                <h2
                  className="text-5xl font-bold text-foreground tracking-wider font-semibold"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Why choose Spillr?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <FeatureCard
                  icon={Shield}
                  title="Complete Privacy"
                  description="Your feedback providers remain completely anonymous, encouraging honest and constructive input."
                  delay={0}
                />
                <FeatureCard
                  icon={Zap}
                  title="Instant Setup"
                  description="Get your feedback wall live in minutes. No complex configuration or technical knowledge required."
                  delay={50}
                />
                <FeatureCard
                  icon={MessageCircle}
                  title="Real Engagement"
                  description="Build deeper connections with your audience through meaningful, two-way communication."
                  delay={100}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-6 py-12 flex items-center justify-center bg-white">
          <div className="w-full max-w-6xl space-y-8">
            <div className="text-center mb-12">
              <h2
                className="text-5xl font-bold text-foreground tracking-wider font-semibold"
                style={{ fontFamily: "Space Grotesk" }}
              >
                How It Works
                <p className="text-lg text-gray-600 max-w-3xl mx-auto pt-4 font-thin">
                  Simple, powerful, and built for everyone.
                </p>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <FeatureCard
                icon={() => (
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <span className="text-xl font-semibold text-white">1</span>
                  </div>
                )}
                title="Create Your Profile"
                description="Create your unique profile in seconds. Customize colors, title, and upload a profile picture."
                bgColor="bg-yellow-200"
                delay={0}
              />
              <FeatureCard
                icon={() => (
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <span className="text-xl font-semibold text-white">2</span>
                  </div>
                )}
                title="Share with Anyone"
                description="Easily share your link with friends or on social media platforms to start receiving anonymous feedback."
                bgColor="bg-yellow-200"
                delay={50}
              />
              <FeatureCard
                icon={() => (
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <span className="text-xl font-semibold text-white">3</span>
                  </div>
                )}
                title="Manage & Respond"
                description="Log in to your dashboard to see all feedback in real time. Reply publicly, react with emojis, archive items, and track engagement."
                bgColor="bg-yellow-200"
                delay={100}
              />
            </div>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fadeIn 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default Home;
