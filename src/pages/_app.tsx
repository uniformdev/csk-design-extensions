import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { IconsProvider, ToastContainer } from '@uniformdev/design-system';
import { MeshApp } from '@uniformdev/mesh-sdk-react';
import '../styles/global.css';

const PAGE_WITHOUT_MESH_LOCATION = ['/_error', '/'];

const App = ({ Component, pageProps }: AppProps) => {
  const { pathname } = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (PAGE_WITHOUT_MESH_LOCATION.includes(pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <MeshApp>
      <IconsProvider>
        <Component {...pageProps} />
        <ToastContainer />
      </IconsProvider>
    </MeshApp>
  );
};

export default App;
