import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <footer className="text-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Contact Info */}
          <div className="bg-[#1F2937] px-6 py-12 text-center">
            <h4 className="text-xl font-semibold text-white mb-4">
              Contact Us
            </h4>
            <p className="text-sm">123 ABS Street, Unit 21, Bangladesh</p>
            <p className="text-sm mt-1">Phone: +88 123456789</p>
            <p className="text-sm mt-1">Mon – Fri: 08:00 – 22:00</p>
            <p className="text-sm">Sat – Sun: 10:00 – 23:00</p>
          </div>

          {/* Social Media */}
          <div className="bg-[#111827] px-6 py-12 text-center">
            <h4 className="text-xl font-semibold text-white mb-4">Follow Us</h4>
            <p className="text-sm">Join us on social media</p>
            <div className="flex justify-center gap-4 mt-4 text-xl">
              <a
                href="#"
                className="hover:text-blue-500 transition-colors duration-300"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="hover:text-pink-500 transition-colors duration-300"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                className="hover:text-sky-400 transition-colors duration-300"
              >
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-[#151515] text-center text-sm py-4">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-white">CulinaryCloud</span>. All
          rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;
