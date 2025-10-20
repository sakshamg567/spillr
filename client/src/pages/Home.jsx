import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import LoadingSpinner  from "../components/Loading";
import Navbar from "../components/Navbar";
import { ArrowRight, Shield, Zap, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";

const Modal = ({ children, onClose }) => {
  useEffect(() => {

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);


  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg p-6 bg-white/10 rounded-lg shadow-lg backdrop-blur-sm border border-white/20"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        ><div className="max-h-[90vh] overflow-y-auto">
          {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hideTitle, setHideTitle] = useState(false);
  const { loading, authMode, setAuthMode, user, logout, isAuthenticated } =
    useAuth();

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/") {
      console.log(" Auto-redirecting authenticated user to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    const handleScroll = () => setHideTitle(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return <LoadingSpinner />;

  const handleCloseModal = () => setAuthMode(null);

  const handleRegisterSuccess = () => {
    setAuthMode(null);
    setTimeout(() => {
      console.log("Navigating to dashboard after registration");
      navigate("/dashboard", { replace: true });
    }, 100);
  };

  const handleLoginSuccess = () => {
    setAuthMode(null);
    setTimeout(() => {
      console.log("Navigating to dashboard after login");
      navigate("/dashboard", { replace: true });
    }, 100);
  };

  return (
    <motion.div
      className="min-h-screen "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <main>
        <div className="min-h-screen w-full relative">
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
          

          <div className="relative z-10 ">
            <section className="flex items-center justify-center min-h-screen bg-cover ">
              <motion.header
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4  "
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {!hideTitle && (
                  <motion.h2
                    className="font-['Fasthin',cursive] text-xl md:text-4xl text-black tracking-wide  pt-2 md:pr-0 transition-opacity duration-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Spillr
                  </motion.h2>
                )}
                <div className="absolute left-1/2 transform -translate-x-1/2 pt-2 pl-12 md:pl-4  ">
                  <Navbar />
                </div>
              </motion.header>

              <AnimatePresence>
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
              </AnimatePresence>

              <motion.div
                className="flex flex-col items-center justify-center max-w-2xl text-center px-4 "
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.08 } },
                  }}
                  className="contents"
                >
                  {/* mobile heading */}
                  <motion.h1
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                    transition={{ duration: 0.15 }}
                    className="m-0 text-5xl md:hidden leading-tight tracking-tight text-balance poster-text"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {"ASK"}
                    <br />
                    {"ANONYMOUSLY,"}
                    <br />
                    {"ANSWER"}
                    <br />
                    {"OPENLY."}
                  </motion.h1>

                  {/* desktop heading */}
                  <motion.h1
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="hidden md:block text-6xl lg:text-7xl text-black leading-none tracking-tight text-balance poster-text"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    ASK <br />
                    ANONYMOUSLY, <br />
                    ANSWER <br />
                    OPENLY.
                  </motion.h1>

                  <motion.p
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-lg text-gray-800 mt-6"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    Share openly or anonymously, whatever feels right. <br />
                    Get real, anonymous insights from your audience. <br />
                    Perfect for creators, professionals, <br />
                    and anyone seeking genuine feedback.
                  </motion.p>

                  {/* Buttons */}
                  {user ? (
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        show: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      onClick={logout}
                      className="mt-8 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:-translate-y-[2px] active:translate-y-[2px] transition-transform text-lg"
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      Logout
                    </motion.button>
                  ) : (
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        show: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      onClick={() => setAuthMode("register")}
                      className="mt-8 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:-translate-y-[2px] active:translate-y-[2px] transition-transform text-lg font-medium"
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                      <ArrowRight className="inline-block ml-2 h-5 w-5" />
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            </section>
          </div>
        </div>
        <motion.div
          className="w-full px-6 py-12 flex items-center justify-center bg-yellow-200 border  border-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-full max-w-6xl space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                className="text-5xl font-bold text-foreground tracking-wider font-semibold"
                style={{ fontFamily: "Space Grotesk" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Why choose Spillr?
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                style={{ fontFamily: "Space Grotesk" }}
                className="flex flex-col bg-card/80 p-6  shadow-card shadow-[6px_6px_0_0_#000] transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg bg-white"
              >
                <motion.div
                  className="gradient-primary p-3 rounded-xl w-fit mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Shield className="h-7 w-7" />
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Complete Privacy
                </motion.h3>
                <motion.p
                  className="text-muted-foreground flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Your feedback providers remain completely anonymous,
                  encouraging honest and constructive input.
                </motion.p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                whileHover={{ y: -6 }}
                className="flex flex-col bg-card/80  p-6 shadow-card transform transition-transform duration-300 border-black shadow-[6px_6px_0_0_#000] ease-out hover:-translate-y-1 hover:shadow-lg bg-white"
                style={{ fontFamily: "Space Grotesk" }}
              >
                <motion.div
                  className="gradient-primary p-3 rounded-xl w-fit mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Zap className="h-7 w-7" />
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Instant Setup
                </motion.h3>
                <motion.p
                  className="text-muted-foreground flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Get your feedback wall live in minutes. No complex
                  configuration or technical knowledge required.
                </motion.p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                whileHover={{ y: -6 }}
                className="flex flex-col bg-card/80  p-6  shadow-card border-black shadow-[6px_6px_0_0_#000] transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg bg-white"
                style={{ fontFamily: "Space Grotesk" }}
              >
                <motion.div
                  className="gradient-primary p-3 rounded-xl w-fit mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  <MessageCircle className="h-7 w-7" />
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Real Engagement
                </motion.h3>
                <motion.p
                  className="text-muted-foreground flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Build deeper connections with your audience through
                  meaningful, two-way communication.
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-full px-6 py-12 flex items-center justify-center bg-white "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-full max-w-6xl space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                className="text-5xl font-bold text-foreground tracking-wider font-semibold"
                style={{ fontFamily: "Space Grotesk" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                How It Works
                <p
                  className="text-lg text-gray-600 max-w-3xl mx-auto pt-4 font-thin"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Simple, powerful, and built for everyone.
                </p>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 ">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                style={{ fontFamily: "Space Grotesk" }}
                className="flex flex-col bg-card/80 p-6  shadow-card shadow-[6px_6px_0_0_#000] transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg bg-yellow-200"
              >
                <motion.div
                  className="gradient-primary p-3 rounded-xl w-fit mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center group ">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mx-auto  group-hover:bg-yellow-200 transition-colors group-hover:text-black">
                      <span className="text-xl font-semibold text-white group-hover:text-black">
                        1
                      </span>
                    </div>
                  </div>
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  
                    Create Your Profile
                  
                </motion.h3>
                <motion.p
                  className="text-muted-foreground flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                 
                    Create your unique profile in seconds.Customize colors,
                    title, and upload a profile picture.
                 
                </motion.p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                whileHover={{ y: -6 }}
                className="flex flex-col bg-card/80  p-6 shadow-card transform transition-transform duration-300 border-black shadow-[6px_6px_0_0_#000] ease-out hover:-translate-y-1 hover:shadow-lg bg-yellow-200"
                style={{ fontFamily: "Space Grotesk" }}
              >
                <motion.div
                  className="gradient-primary p-3 rounded-xl w-fit mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center group ">
                     <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mx-auto  group-hover:bg-yellow-200 transition-colors group-hover:text-black">
                      <span className="text-xl font-semibold text-white group-hover:text-black">
                        2
                      </span>
                    </div>
                  </div>
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  
                    Share with Anyone
                  
                </motion.h3>
                <motion.p
                  className="text-muted-foreground flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  
                    Easily share your link with friends or on social media
                    platforms to start receiving anonymous feedback.
                  
                </motion.p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                whileHover={{ y: -6 }}
                className="flex flex-col bg-card/80  p-6  shadow-card border-black shadow-[6px_6px_0_0_#000] transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg bg-yellow-200"
                style={{ fontFamily: "Space Grotesk" }}
              >
                <motion.div
                  className="gradient-primary p-3 rounded-xl w-fit mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  <div className="text-center group ">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mx-auto  group-hover:bg-yellow-200 transition-colors group-hover:text-black">
                      <span className="text-xl font-semibold text-white group-hover:text-black">
                        3
                      </span>
                    </div>
                  </div>
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                 
                    Manage & Respond
                  
                </motion.h3>
                <motion.p
                  className="text-muted-foreground flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: "Space Grotesk" }}
                >
                 
                    Log in to your dashboard to see all feedback in real time.
                    Reply publicly, react with emojis, archive items, and track
                    engagement.
                  
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

       
      </main>
       <Footer />
    </motion.div>
  );
};

export default Home;
