import { Navbar, NavbarCollapse, NavbarToggle } from "flowbite-react";
import { Link } from "react-router-dom";

import { IoSearchSharp } from "react-icons/io5";
import { LuTicket } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";

export function NavbarCom() {
  return (
    <Navbar
      fluid
      rounded={false}
      className="sticky top-0 z-50 w-full shrink-0 !bg-[#27272a] px-6 py-4"
    >
      <div className="flex w-full items-center justify-between gap-6">
        {/* Left: Search input */}
        <div className="hidden items-center justify-between gap-2 rounded-full border border-gray-600 bg-transparent py-2 pl-5 pr-2 md:flex md:w-64">
          <input
            type="text"
            placeholder="Search Movies...."
            className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-400 outline-none"
          />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-300">
            <IoSearchSharp className="h-4 w-4" />
          </span>
        </div>

        {/* Center: Logo */}
        <Link to="/" className="mx-auto flex items-center md:mx-0">
          <span className="text-xl font-extrabold uppercase tracking-widest text-white">
            Cambo Movie
          </span>
        </Link>

        {/* Right: Ticket, Join Now, Notification, Avatar */}
        <div className="flex items-center gap-3">
          <Link
            to="/tickets"
            className="hidden items-center gap-2 rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-white transition hover:border-white md:flex"
          >
            <LuTicket className="h-4 w-4" />
            <span>Ticket</span>
          </Link>

          <Link
            to="/user"
            aria-label="User account"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-red-950 text-gray-200 transition hover:opacity-90"
          >
            <FaRegUser className="h-4 w-4" />
          </Link>

          <Link
            to="/notification"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-500 text-gray-200 transition hover:border-white"
          >
            <IoNotificationsOutline className="h-5 w-5" />
            {/* <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-600" /> */}
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <NavbarToggle className="text-gray-300 md:hidden" />
      </div>

      {/* Mobile collapse */}
      <NavbarCollapse className="md:hidden">
        <div className="mt-2 flex items-center justify-between gap-2 rounded-full border border-gray-600 px-5 py-2">
          <input
            type="text"
            placeholder="Search Movies...."
            className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-400 outline-none"
          />
          <IoSearchSharp className="h-4 w-4 shrink-0 text-gray-300" />
        </div>

        <Link
          to="/tickets"
          className="mt-2 flex items-center justify-center gap-2 rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-white"
        >
          <LuTicket className="h-4 w-4" />
          <span>Ticket</span>
        </Link>

        <Link
          to="/login"
          className="mt-2 flex items-center justify-center gap-2 rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-white"
        >
          <FaRegUser className="h-4 w-4" />
          <span>Join Now</span>
        </Link>

        {/* <Link
          to="/notification"
          className="mt-2 flex items-center justify-center gap-2 rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-white"
        >
          <IoNotificationsOutline className="h-4 w-4" />
          <span>Notifications</span>
        </Link> */}
      </NavbarCollapse>
    </Navbar>
  );
}
