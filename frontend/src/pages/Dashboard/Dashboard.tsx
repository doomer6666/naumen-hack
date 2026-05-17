import React from "react";
import WelcomeBanner from "./WelcomeBanner";
import ProgressWidget from "./ProgressWidget";
import MoodWidget from "./MoodWidget";
import TasksWidget from "./TasksWidget";
import "./Dashboard.css";
import { AchievementsWidget } from "./AchievementsWidget";

const Dashboard: React.FC = () => {
  return (
    <>
      <WelcomeBanner />

      <div className="dashboard-grid">
        <ProgressWidget />
        <MoodWidget />
        <TasksWidget />
        <AchievementsWidget />
      </div>
    </>
  );
};

export default Dashboard;
