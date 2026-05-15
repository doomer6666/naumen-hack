import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
// import { useAuth } from "../../context/AuthContext";

const AppLayout: React.FC = () => {
  //   const { role } = useAuth();

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
