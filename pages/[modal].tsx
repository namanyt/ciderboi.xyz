import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import s from '@/public/social.json';

export default function Model() {
	const router = useRouter();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		if (router.isReady) {
			setIsReady(true);
		}
	}, [router.isReady]);

	if (!isReady) {
		return null; // Wait until the router is ready
	}

	let modal = router.query.modal;
	let r = Array.isArray(modal) ? modal[0] : modal;
	let social = s as { [key: string]: string };
	let modalList = ['about', 'music', 'projects', 'links'];

	// Determine the page title based on the redirect target
	let pageTitle = 'Redirecting...';
	if (r && social[r]) {
		pageTitle = `Redirecting to ${r}`;
	} else if (r && modalList.includes(r)) {
		pageTitle = `Loading ${r}`;
	} else {
		pageTitle = '404 - Not Found';
	}

	return (
		<>
			<Head>
				<title>{pageTitle}</title>
			</Head>
			{/* Handle redirection */}
			{r && social[r] ? (
				<meta httpEquiv="refresh" content={`0; url=${social[r]}`} />
			) : r && modalList.includes(r) ? (
				<meta httpEquiv="refresh" content={`0; url=/?page=${modal}`} />
			) : (
				<meta httpEquiv="refresh" content="0; url=/404" />
			)}
		</>
	);
}
