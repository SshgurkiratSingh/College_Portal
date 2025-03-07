import "./globals.css";
import { Inter } from "next/font/google";
import { Nunito } from "next/font/google";
import Navbar from "./components/NavBar/Navbar";
import ClientOnly from "./components/ClientOnly";
import Modals from "./components/modals/Modals";
import RegisterModal from "./components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "./components/modals/LoginModal";
import getCurrentUser from "./actions/getCurrentUser";
import AddModal from "./components/modals/AddModal";
import NotificationModal from "./components/modals/notificationModal";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DrinkDes",
  description: "Vending MAchine Portal",
};
const font = Nunito({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  console.log(currentUser);
  return (
    <html lang="en">
      <body className={font.className}>
        <ClientOnly>
          <ToasterProvider />
          <RegisterModal />
          <LoginModal />
          <NotificationModal currentUser={currentUser} />
          {currentUser?.email === "guri2022@hotmail.com" ? (
            <AddModal />
          ) : (
            <div></div>
          )}
          <Navbar currentUser={currentUser} />
        </ClientOnly>
        <main>{children}</main>
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic";
