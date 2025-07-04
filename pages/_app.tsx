import "../styles/globals.css";
import "../styles/components.css";  // Add this line
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

