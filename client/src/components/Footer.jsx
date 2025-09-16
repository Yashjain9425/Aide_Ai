import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="w-full bg-white text-gray-600 px-6 md:px-16 lg:px-24 xl:px-32 pt-12 mt-20 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between gap-12 pb-10 border-b border-gray-300">
        {/* Logo and Description */}
        <div className="max-w-md">
          <img src={assets.logo1} alt="QuickAi Logo" className="h-20" />
          <p className="mt-6 text-sm leading-relaxed">
            Experience the power of AI with <strong>QuickAi</strong>. Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your productivity like never before.
          </p>
        </div>

        {/* Navigation & Subscription */}
        <div className="flex flex-col sm:flex-row gap-12 flex-1 justify-end">
          {/* Navigation Links */}
          <div>
            <h2 className="text-gray-900 font-semibold mb-4">Company</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Home</a></li>
              <li><a href="#" className="hover:text-primary transition">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="text-gray-900 font-semibold mb-4">Subscribe to our newsletter</h2>
            <p className="text-sm mb-4">Stay updated with the latest news, insights, and AI trends—delivered weekly.</p>
            <form className="flex items-center gap-2">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white text-sm px-4 py-2 rounded hover:bg-primary-dark transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-xs md:text-sm mt-6 pb-6 text-gray-500">
        <p>
          &copy; 2025 <a href="https://www.linkedin.com/in/yashjain9425/" className="hover:text-primary">Yash Jain</a>. All rights reserved.
        </p>
        <p className="mt-1">
          GitHub: <a href="https://github.com/Yashjain9425" className="hover:text-primary">Yashjain9425</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
