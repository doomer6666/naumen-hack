// @ts-nocheck
const Header = ({ title, userName, userRole, userInitials }) => {
  return (
    <header className="header">
      <h1 className="page-title">{title}</h1>
      <div className="user-profile">
        <div className="avatar">{userInitials}</div>
        <div className="user-info">
          <p className="name">{userName}</p>
          <p className="role">{userRole}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
