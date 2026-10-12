import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import localFont from "next/font/local";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin", "thai"],
  weight: ["200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bai-jamjuree",
});
const arundinaSansMono = localFont({
  src: "../fonts/Arundinamono.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-arundina-sans-mono",
  declarations: [{ prop: "size-adjust", value: "150%" }],
});
export const metadata: Metadata = {
  title: "THAI Please | Wallet",
  description: "กระเป๋าเงิน Coins และร้านค้าชุมชน",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${baiJamjuree.variable} ${arundinaSansMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
