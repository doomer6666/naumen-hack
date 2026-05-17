import React from "react";
import WelcomeBanner from "./WelcomeBanner";
import ProgressWidget from "./ProgressWidget";
import MoodWidget from "./MoodWidget";
import TasksWidget from "./TasksWidget";
import BadgesWidget from "./BadgesWidget";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <>
      <WelcomeBanner />

      <div className="dashboard-grid">
        <ProgressWidget />
        <MoodWidget />
        <TasksWidget />
        <BadgesWidget />
      </div>
    </>
  );
};

export default Dashboard;
