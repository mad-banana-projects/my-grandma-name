import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ivyJournalLight = localFont({
  src: [
    { path: "../public/fonts/ivy-journal-light.ttf", style: "normal" },
    { path: "../public/fonts/ivy-journal-light-italic.ttf", style: "italic" },
  ],
  variable: "--font-ivy-light",
  display: "swap",
});

const ivyJournalRegular = localFont({
  src: "../public/fonts/ivy-journal-regular.ttf",
  variable: "--font-ivy-regular",
  display: "swap",
});

const arnoPro = localFont({
  src: "../public/fonts/arno-pro-semibold.ttf",
  variable: "--font-arno",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Grandma Name",
  description: "Choose your grandma name. Share the gifts you actually want.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ivyJournalLight.variable} ${ivyJournalRegular.variable} ${arnoPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
