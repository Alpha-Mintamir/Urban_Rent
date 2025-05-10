'use client';

import React from 'react';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 px-6 py-8 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
        {/* Company Section */}
        <div>
          <h3 className="text-lg font-semibold text-pink-500">Company</h3>
          <ul className="mt-4 space-y-2 text-gray-400">
            <li>
              <a href="/client/src/about" className="hover:text-white">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white">
                Contact us
              </a>
            </li>
            <li>
              <a href="/careers" className="hover:text-white">
                Careers
              </a>
            </li>
            <li>
              <a href="/culture" className="hover:text-white">
                Culture
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-white">
                Blog
              </a>
            </li>
          </ul>
        </div>

        {/* Contacts Section */}
        <div>
          <h3 className="text-lg font-semibold text-pink-500">Contact us</h3>
          <ul className="mt-4 space-y-2 text-gray-400">
            <li>
              <a
                href="mailto:Urban.rent@gmail.com"
                className="hover:text-white"
              >
                Urban.rent@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+251968015154" className="hover:text-white">
                +251968015154
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div className="mt-4 flex space-x-6 md:mt-0">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <FaFacebook className="h-6 w-6" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <FaTwitter className="h-6 w-6" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <FaInstagram className="h-6 w-6" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <FaLinkedin className="h-6 w-6" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <FaYoutube className="h-6 w-6" />
          </a>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        <p>&copy; 2023 Urban Rent, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
