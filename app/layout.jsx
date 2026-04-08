export const metadata = {
  title: 'TikTok Live Arena',
  description: 'Interactive game powered by TikTok Live',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-black overflow-hidden m-0 p-0">{children}</body>
    </html>
  );
}
