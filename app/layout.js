import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { Loader } from '@/components/ui/Loader';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata = {
  title: 'Kalkulator SDMK',
  description: 'Analisis Kebutuhan Sumber Daya Manusia Kesehatan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AppProvider>
          <Loader />
          <ToastContainer />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
