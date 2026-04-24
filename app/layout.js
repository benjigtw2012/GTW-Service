import './globals.css';

export const metadata = {
  title: 'GTW Survey App',
  description: 'Window and door service survey app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
