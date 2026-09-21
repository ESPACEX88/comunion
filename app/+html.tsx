import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: background }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const background = `
body {
  background-color: #F3EADA;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1C1712;
  }
}
`;
