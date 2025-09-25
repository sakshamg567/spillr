const Footer = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-6 gap-4 md:gap-0">
        {/* Logo */}
        <div className="flex items-center">
          
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center md:justify-end space-x-4 text-gray-500">
          <a href="/privacy" className="hover:text-gray-700">
            Privacy
          </a>
          <a href="/terms" className="hover:text-gray-700">
            Terms
          </a>
          <a href="/contact" className="hover:text-gray-700">
            Contact
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-3 text-center text-gray-500 text-sm px-4 md:px-8">
        &copy; {new Date().getFullYear()} Spillr. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
