import SettingsHeader from "./settings/settings-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SettingsHeader />
      {children}
    </>
  );
};

export default Layout;
