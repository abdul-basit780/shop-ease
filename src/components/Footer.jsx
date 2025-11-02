import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send, Heart } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = React.useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail('');
  };

  const quickLinks = [
    { name: 'All Products', href: '/customer/all-products' },
    { name: 'Categories', href: '/customer/all-categories' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ];

  const customerServiceLinks = [
    { name: 'My Account', href: '/customer/profile' },
    { name: 'Order History', href: '/customer/orders' },
    { name: 'Wishlist', href: '/customer/wishlist' },
    { name: 'Track Order', href: '/customer/orders' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Returns', href: '/returns' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute w-96 h-96 bg-primary-500 rounded-full blur-3xl -top-48 -left-48 animate-float"></div>
        <div className="absolute w-96 h-96 bg-secondary-500 rounded-full blur-3xl -bottom-48 -right-48 animate-float animation-delay-1000"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6 group">
              <div className="relative w-14 h-14 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-xl">
                <span className="text-white font-extrabold text-2xl">SE</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white">ShopEase</span>
                <div className="text-xs text-gray-400 font-medium -mt-1">Smart Shopping Experience</div>
              </div>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your one-stop destination for personalized shopping experiences. Discover products tailored just for you with our AI-powered personalized recommendations.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="group w-11 h-11 bg-gray-800 hover:bg-gradient-to-br hover:from-primary-600 hover:to-secondary-600 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="#" 
                className="group w-11 h-11 bg-gray-800 hover:bg-gradient-to-br hover:from-primary-600 hover:to-secondary-600 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <Twitter className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="#" 
                className="group w-11 h-11 bg-gray-800 hover:bg-gradient-to-br hover:from-primary-600 hover:to-secondary-600 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Customer Service
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {customerServiceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Contact Us
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 transition-colors">
                  <MapPin className="h-5 w-5 text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    123 Commerce Street<br />Business City, BC 12345
                  </p>
                </div>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 transition-colors">
                  <Phone className="h-5 w-5 text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 transition-colors">
                  <Mail className="h-5 w-5 text-primary-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">support@shopease.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© {new Date().getFullYear()} ShopEase. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              <span>All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600"></div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </footer>
  );
};