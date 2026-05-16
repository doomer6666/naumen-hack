import React from "react";
import { EmployeeCabinet } from "./EmployeeCabinet";
import { HRCabinet } from "./HRCabinet";
import { MentorCabinet } from "./MentorCabinet";
import "./Profile.css";
import { useAuth } from "../../context/AuthContext";

export const ProfilePage: React.FC = () => {
  const { role } = useAuth();

  return (
    <>
      {role === "newbie" && <EmployeeCabinet />}
      {role === "hr" && <HRCabinet />}
      {role === "mentor" && <MentorCabinet />}
    </>
  );
};
