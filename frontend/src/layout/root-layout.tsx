// import React from "react";
import { Outlet } from "react-router-dom";
import { NavbarCom } from "./navbar";

// control on havbar, mainPage and footer
function Rootlayout() {
  return (
    <>
      <div>
        {/* navbar */}
        <NavbarCom />

        {/* main */}
        <section>
          <Outlet />
        </section>

        {/* footer */}
        {/* <section className="fixed bottom-0 left-0 z-50 w-full">
          <FooterCom />
        </section> */}
      </div>
    </>
  );
}

export default Rootlayout;
