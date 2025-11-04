import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Toaster } from 'react-hot-toast';
import { CartWishlistProvider } from '@/contexts/CartWishlistContext';

const Layout = ({ children }) => {
  return (
    <CartWishlistProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow pt-20 min-h-[600px]">
          {children}
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </CartWishlistProvider>
  );
};

export default Layout;