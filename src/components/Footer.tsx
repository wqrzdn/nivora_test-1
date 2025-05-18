import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary-900 text-secondary-100">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Nivora</h3>
            <p className="mb-4 text-secondary-300">Find your perfect home and roommate with Nivora.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-300 hover:text-white" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-secondary-300 hover:text-white" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="text-secondary-300 hover:text-white">Properties</Link>
              </li>
              <li>
                <Link to="/roommates" className="text-secondary-300 hover:text-white">Roommates</Link>
              </li>
              <li>
                <Link to="/login" className="text-secondary-300 hover:text-white">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-secondary-300 hover:text-white">Sign Up</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-secondary-300 hover:text-white">Help Center</Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-300 hover:text-white">Contact Us</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary-300 hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary-300 hover:text-white">Terms of Service</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                <span>123 Rental Street, Apartment City, Country</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary-500" />
                <span>support@nivora.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary-800 mt-12 pt-8 text-center text-secondary-400">
          <p>© {currentYear} Nivora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 