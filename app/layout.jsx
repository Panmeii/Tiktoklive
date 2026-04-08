export const metadata = {
  title: 'TikTok Live Arena',
  description: 'Interactive game powered by TikTok Live',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-black overflow-hidden">{children}</body>
    </html>
  );
}
