import './globals.css';

export const metadata = {
  title: "FarSight",
  description: "Vibration Isolators and Air Filters",
  keywords: "Vibration Isolators, Air Filters, FarSight",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">


        {/* Page Content */}
        <main>{children}</main>


      </body>
    </html>
  );
}
