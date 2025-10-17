import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout"

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Don't wrap admin pages with the main Layout
  const isAdminPage = router.pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return <Component {...pageProps} />;
  }
  
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
