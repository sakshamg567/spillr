import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { LoadingCard } from "../components/Loading"
import Navbar from "../components/Navbar"
import { ArrowRight, Shield, Zap, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import turquoise from '../assets/teals.jpeg'
import blue from "../assets/pale.jpeg"
import LoginForm from "../components/auth/LoginForm"
import RegisterForm from "../components/auth/RegisterForm"
import Footer from '../components/Footer'

const Modal = ({ children, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="w-full h-full flex items-center justify-center p-6 bg-white/80 backdrop-blur-md">
          <motion.div
            className="w-full max-w-lg p-6 bg-white/10 rounded-lg shadow-lg backdrop-blur-md border border-white/20"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

const Home = () => {
  const navigate = useNavigate()
  const [hideTitle, setHideTitle] = useState(false)
  const { loading, authMode, setAuthMode, user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setHideTitle(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (loading) return <LoadingCard />

  const handleCloseModal = () => setAuthMode(null)

  const handleRegisterSuccess = () => {
    setAuthMode(null)
    navigate("/dashboard", { replace: true })
  }

  const handleLoginSuccess = () => {
    setAuthMode(null)
    navigate("/dashboard", { replace: true })
  }

  return (
    <motion.div className="min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <main>
        <section
          className="flex items-center justify-center min-h-screen bg-cover bg-center "
          style={{ backgroundImage: `url(${blue})` }}
        >
          <motion.header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 "
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!hideTitle && (
              <motion.h2
                className="font-['Fasthin',cursive] text-3xl md:text-4xl text-black tracking-wide pl-2 pt-2 transition-opacity duration-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Spillr
              </motion.h2>
            )}
            <div className="absolute left-1/2 transform -translate-x-1/2 pt-2">
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
            className="flex flex-col items-center justify-center max-w-2xl text-center px-4"
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
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="m-0 text-5xl md:hidden text-black leading-tight tracking-tight poster-text "
              >
                ASK
                <br />
                ANONYMOUSLY,
                <br />
                ANSWER
                <br />
                OPENLY.
              </motion.h1>

              {/* desktop heading */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="hidden md:block text-6xl lg:text-7xl text-black leading-none tracking-tight text-balance poster-text"
              >
                ASK <br />
                ANONYMOUSLY, <br />
                ANSWER <br />
                OPENLY.
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-lg text-gray-700 pt-8"
              >
                Share openly or anonymously, whatever feels right. <br />
                Get real, anonymous insights from your audience. <br />
                Perfect for creators, professionals, <br />
                and anyone seeking genuine feedback.
              </motion.p>

              {user ? (
                <motion.button
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onClick={logout}
                  className="mt-8 gradient-primary flex items-center gap-2 px-3 py-2 text-black  font-semibold shadow-glow text-lg hover:shadow-elegant hover:scale-105 active:scale-95 transition-all duration-200 group bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-full"
                >
                  <span className="tracking-tight">Logout</span>
                </motion.button>
              ) : (
                <motion.button
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onClick={() => setAuthMode("register")}
                  className="mt-8 gradient-primary flex items-center gap-2 px-3 py-2 text-black  font-semibold shadow-glow text-lg hover:shadow-elegant hover:scale-105 active:scale-95 transition-all duration-200 group bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-full"
                >
                  <span className="tracking-tight font-normal text-lg">Get Started</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </section>
        <motion.div
          className="w-full px-6 py-12 flex items-center justify-center"
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
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                className="text-3xl font-bold text-foreground mb-2 tracking-wider font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Why choose Spillr?
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className="flex flex-col bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-card border border-border/50 transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
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
                >
                  Complete Privacy
                </motion.h3>
                <motion.p
                  className="text-muted-foreground flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Your feedback providers remain completely anonymous, encouraging honest and constructive input.
                </motion.p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                whileHover={{ y: -6 }}
                className="flex flex-col bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-card border border-border/50 transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
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
                >
                  Get your feedback wall live in minutes. No complex configuration or technical knowledge required.
                </motion.p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                whileHover={{ y: -6 }}
                className="flex flex-col bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-card border border-border/50 transform transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
              >
                <motion.div
                  className="gradient-primary p-3 rounded-xl w-fit mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
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
                >
                  Build deeper connections with your audience through meaningful, two-way communication.
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        {/* How It Works Section */}
<section className="py-24 bg-center bg-cover" style={{ backgroundImage: `url(${turquoise})` }}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        How It Works
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Simple, powerful, and built for everyone. 
      </p>
    </div>

    {/* 3-Step Process */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
      {/* Step 1 */}
      <div className="text-center group">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-white transition-colors">
          <span className="text-2xl font-bold text-black">1</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Profile</h3>
        <p className="text-gray-600">
          Create your unique profile in seconds.Customize colors, title, and upload a profile picture.
        </p>
      </div>

      {/* Step 2 */}
      <div className="text-center group">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-white transition-colors">
          <span className="text-2xl font-bold text-black">2</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Share with Anyone</h3>
        <p className="text-gray-600">
          Easily share your link with friends or on social media platforms to start receiving anonymous feedback.


        </p>
      </div>

      {/* Step 3 */}
      <div className="text-center group">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-white transition-colors">
          <span className="text-2xl font-bold text-black">3</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Manage & Respond</h3>
        <p className="text-gray-600">
          Log in to your dashboard to see all feedback in real time. Reply publicly, react with emojis, archive items, and track engagement.
        </p>
      </div>
    </div>

    
     
    </div>
  
</section>
<Footer />
      </main>

    </motion.div>
  )
}

export default Home
