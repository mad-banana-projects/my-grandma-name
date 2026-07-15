import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
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
  src: "../public/fonts/arno-pro-semibold-subhead.otf",
  variable: "--font-arno",
  display: "swap",
});

const arnoProItalic = localFont({
  src: "../public/fonts/arno-pro-semibold-italic.otf",
  variable: "--font-arno-italic",
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
      className={`${ivyJournalLight.variable} ${ivyJournalRegular.variable} ${arnoPro.variable} ${arnoProItalic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5XF754LR"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5XF754LR');
        `}</Script>
        {/* Google tag (gtag.js) */}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-LNKY7M82KK" />
        <Script id="gtag-config" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LNKY7M82KK');
        `}</Script>
      </body>
    </html>
  );
}
