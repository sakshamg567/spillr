import { useState } from "react";
import Modal from "./Modal";

const Footer = () => {
  const [modalContent, setModalContent] = useState(null);

  const privacyPolicy = (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>  
    <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Definitions</h2>
        <p>The feedback or opinion that a user gives to other users on our platform.</p>

        <h2 className="text-2xl font-semibold">Information You Share</h2>
        <p>Some services require registration and provide certain personal data.</p>

        <h2 className="text-2xl font-semibold">Information We Collect</h2>
        <p>IP Address, Cookies, Timestamps, and analytics data.</p>

        <h2 className="text-2xl font-semibold">Third-Party Services</h2>
        <p>Email providers, analytics and push notifications.</p>

        <h2 className="text-2xl font-semibold">Opting Out</h2>
        <p>You can adjust your browser to block cookies, but some features may not work.</p>

        <h2 className="text-2xl font-semibold">Policy Changes</h2>
        <p>We may update this policy at any time without prior notice.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Contact Us</h2>
        <p>
          Email:{" "}
          <a href="mailto:spillr.app.email@gmail.com" className="underline text-blue-500">
            spillr.app.email@gmail.com
          </a>
        </p>
      </section>
    </div>
  );

  const termsAndConditions = (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Terms and Conditions</h1>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Introduction</h2>
        <p>Welcome to Spillr. Please read these Terms and Conditions carefully before use.</p>

        <h2 className="text-2xl font-semibold">User Responsibilities</h2>
        <p>Maintain confidentiality, provide truthful information, and use the platform ethically.</p>

        <h2 className="text-2xl font-semibold">Acceptable Use</h2>
        <p>You must not violate laws, harass others, or post harmful content.</p>

        <h2 className="text-2xl font-semibold">Content Guidelines</h2>
        <p>No pornographic, violent, discriminatory, or infringing content.</p>

        <h2 className="text-2xl font-semibold">Intellectual Property Rights</h2>
        <p>All content belongs to Spillr or licensors. No unauthorized reproduction.</p>

        <h2 className="text-2xl font-semibold">Disclaimers & Limitation of Liability</h2>
        <p>The service is provided "as is" without warranties. We are not liable for indirect damages.</p>

        <h2 className="text-2xl font-semibold">Termination</h2>
        <p>We may terminate access without notice for breach of terms.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Contact Us</h2>
        <p>
          Email:{" "}
          <a href="mailto:spillr.app.email@gmail.com" className="underline text-blue-500">
            spillr.app.email@gmail.com
          </a>
        </p>
      </section>
    </div>
  );

  const contactUs = (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="text-sm text-gray-500">We’d love to hear from you!</p>
      <p>
        Email:{" "}
        <a href="mailto:spillr.app.email@gmail.com" className="underline text-blue-500">
          spillr.app.email@gmail.com
        </a>
      </p>
      <p>For questions, concerns, or feedback, feel free to contact us at any time.</p>
    </div>
  );

  return (

 <footer  >
      <div className=" mx-auto px-6 py-8 text-gray-100 bg-gray-700">
        {/* Footer Top */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0">
          <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-bold">Spillr</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Share and receive anonymous feedback with ease and privacy.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <button
              onClick={() => setModalContent(privacyPolicy)}
              className="hover:underline hover:text-white transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setModalContent(termsAndConditions)}
              className="hover:underline hover:text-white transition"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setModalContent(contactUs)}
              className="hover:underline hover:text-white transition"
            >
              Contact Us
            </button>
          </div>
        </div>

      
        <div className="mt-4 border-t border-gray-400 pt-3 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Spillr. All rights reserved.
        </div>
      </div>

      
      {modalContent && (
        <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>
      )}
    </footer>
  );
};

export default Footer;
