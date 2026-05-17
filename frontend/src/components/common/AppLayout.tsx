import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";

const AppLayout: React.FC = () => {

  return (
    <>
      <TopBar />
      <main className="main-content">
        <Outlet />{" "}
      </main>
    </>
  );
};

export default AppLayout;
