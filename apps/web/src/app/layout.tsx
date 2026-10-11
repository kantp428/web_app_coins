import type { Metadata } from "next";
import { Bai_Jamjuree, Chivo_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin", "thai"],
  weight: ["200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bai-jamjuree",
});
const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  variable: "--font-chivo-mono",
});
export const metadata: Metadata = {
  title: "THAI Please | Wallet",
  description: "กระเป๋าเงินและร้านค้าชุมชน — Mobile UI Preview",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${baiJamjuree.variable} ${chivoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
