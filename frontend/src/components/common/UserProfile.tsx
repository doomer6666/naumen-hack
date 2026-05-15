import React from "react";

interface UserProfileProps {
  name: string;
  initials: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, initials }) => {
  return (
    <div className="user-profile">
      <div className="avatar">{initials}</div>
      <span className="user-name">{name}</span>
    </div>
  );
};

export default UserProfile;
