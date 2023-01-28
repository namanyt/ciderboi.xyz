import { useRouter } from 'next/router';
import { useEffect } from 'react';

import s from '@/public/social.json';

export default function Model() {
	const router = useRouter();
	let modal = router.query.modal;

	let r = Array.isArray(modal) ? modal[0] : modal;
	let social = s as { [key: string]: string };

	if (r && r in social) {
		return <meta httpEquiv="refresh" content={`0; url=${social[r]}`} />;
	} else if (r == 'webowser') {
		return <meta httpEquiv="refresh" content={`0; url=https://webowser.com`} />;
	} else {
		console.log(r);
		return <meta httpEquiv="refresh" content={`0; url=/?page=${modal}`} />;
	}
}
