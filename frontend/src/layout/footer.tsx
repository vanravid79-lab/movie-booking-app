// import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaTelegramPlane,
  FaGooglePlay,
  FaApple,
  FaCcVisa,
} from "react-icons/fa";
import { SiMastercard } from "react-icons/si";

function FooterCom() {
  return (
    <>
      <footer className="bg-[#27272a] text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Main Footer */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {/* Company */}
            <div>
              <h3 className="mb-4 text-sm font-bold">Company</h3>

              <ul className="space-y-3 text-xs text-gray-400">
                <li>
                  <a href="#" className="transition hover:text-white">
                    About Us
                  </a>
                </li>

                <li>
                  <a href="#" className="transition hover:text-white">
                    Contact Us
                  </a>
                </li>

                <li>
                  <a href="#" className="transition hover:text-white">
                    Cinemas
                  </a>
                </li>
              </ul>
            </div>

            {/* More */}
            <div>
              <h3 className="mb-4 text-sm font-bold">More</h3>

              <ul className="space-y-3 text-xs text-gray-400">
                <li>
                  <a href="#" className="transition hover:text-white">
                    Promotions
                  </a>
                </li>

                <li>
                  <a href="#" className="transition hover:text-white">
                    News & Activity
                  </a>
                </li>

                <li>
                  <a href="#" className="transition hover:text-white">
                    My Ticket
                  </a>
                </li>

                <li>
                  <a href="#" className="transition hover:text-white">
                    Terms & Conditions
                  </a>
                </li>

                <li>
                  <a href="#" className="transition hover:text-white">
                    Privacy & Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Download + Social */}
            <div>
              <h3 className="mb-4 text-sm font-bold">Download Our App</h3>

              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 transition hover:border-white hover:text-white"
                >
                  <FaGooglePlay size={15} />
                </a>

                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 transition hover:border-white hover:text-white"
                >
                  <FaApple size={16} />
                </a>
              </div>

              {/* Social Media */}
              <h3 className="mb-4 mt-6 text-sm font-bold">
                Follow Our Social Media
              </h3>

              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 transition hover:border-white hover:text-white"
                >
                  <FaFacebookF size={13} />
                </a>

                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 transition hover:border-white hover:text-white"
                >
                  <FaInstagram size={14} />
                </a>

                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 transition hover:border-white hover:text-white"
                >
                  <FaYoutube size={14} />
                </a>

                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 transition hover:border-white hover:text-white"
                >
                  <FaTiktok size={14} />
                </a>

                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 transition hover:border-white hover:text-white"
                >
                  <FaTelegramPlane size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-8">
            <h3 className="mb-5 text-sm font-bold">Payment</h3>

            <div className="flex items-center gap-10">
              {/* ABA PayWay */}
              <span className="text-lg font-bold italic text-cyan-600">
                ABA <span className="text-cyan-500">PAYWAY</span>
              </span>

              {/* Visa */}
              <FaCcVisa className="text-blue-600" size={42} />

              {/* Mastercard */}
              <SiMastercard className="text-red-500" size={40} />
            </div>
          </div>

          {/* Bottom Border */}
          <div className="mt-8 border-t border-gray-800" />
        </div>
      </footer>
    </>
  );
}

export default FooterCom;
