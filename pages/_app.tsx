import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<MantineProvider
			withGlobalStyles
			withNormalizeCSS
			theme={{
				/** Put your mantine theme override here */
				fontFamily: 'Raleway, sans-serif',
				colorScheme: 'dark',
			}}
		>
			<Component {...pageProps} />
		</MantineProvider>
	);
}
