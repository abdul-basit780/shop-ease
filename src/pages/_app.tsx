import { useState, useEffect } from 'react';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Add page-loaded class after initial render to enable animations
  useEffect(() => {
    document.documentElement.classList.add('page-loaded');
    document.body.classList.add('page-loaded');
  }, []);

  // Handle route changes
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true);
      document.documentElement.classList.remove('page-loaded');
      document.body.classList.remove('page-loaded');
    };

    const handleRouteChangeComplete = () => {
      setIsLoading(false);
      setTimeout(() => {
        document.documentElement.classList.add('page-loaded');
        document.body.classList.add('page-loaded');
      }, 100);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router.events]);
  
  // Don't wrap admin pages with the main Layout
  const isAdminPage = router.pathname.startsWith('/admin');
  
  // Render content based on page type
  const renderContent = () => {
    if (isAdminPage) {
      return <Component {...pageProps} />;
    }
    
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  };
  
  return (
    <>
      {/* Show loading progress bar during route changes */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
      )}
      
      {/* Always render the page content */}
      {renderContent()}
    </>
  );
}