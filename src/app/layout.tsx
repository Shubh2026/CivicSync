import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicSync – Connect. Volunteer. Change.",
  description:
    "CivicSync connects passionate volunteers with NGOs and social groups to turn data into action and people into change. Join thousands making a real community impact.",
  keywords: "volunteer, NGO, community, civic engagement, social impact, volunteering platform",
  openGraph: {
    title: "CivicSync – Connect. Volunteer. Change.",
    description:
      "Connect with NGOs and social groups to make a real difference in your community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
