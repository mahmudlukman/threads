import Bottombar from "@/components/shared/Bottombar";
import Topbar from "@/components/shared/Topbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Topbar />

      <main className="flex flex-row">
        {/* <LeftSidebar /> */}
        <section className="main-container">
          <div className="w-full max-w-4xl">{children}</div>
        </section>
        {/* <RightSidebar /> */}
      </main>

      <Bottombar />
    </>
  );
};

export default Layout;
