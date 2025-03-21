const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-6">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex justify-center items-center">
          <p className="text-base text-white">
            © {currentYear} MindfulMeds All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
