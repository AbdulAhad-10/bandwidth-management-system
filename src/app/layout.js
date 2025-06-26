import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Bandwidth Management",
  description: "A web-based system to manage and monitor network bandwidth.",
  applicationName: "Bandwidth Management System",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>{children}</body>

      <Toaster />
    </html>
  );
}
