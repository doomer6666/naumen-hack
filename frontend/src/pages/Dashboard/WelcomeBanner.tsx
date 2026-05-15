import React from "react";
import { Rocket, HandMetal } from "lucide-react";

const WelcomeBanner: React.FC = () => {
  return (
    <div className="welcome-banner">
      <div className="welcome-text">
        <h2>
          Добро пожаловать в команду NAUMEN! <HandMetal size={28} />
        </h2>
        <p>
          Вы успешно завершили этап оформления. Впереди много интересного! На
          этой неделе мы познакомим вас с корпоративной культурой и базовыми
          инструментами автоматизации.
        </p>
      </div>
      <Rocket size={72} strokeWidth={1.5} />
    </div>
  );
};

export default WelcomeBanner;
