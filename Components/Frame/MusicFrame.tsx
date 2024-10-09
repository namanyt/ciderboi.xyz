interface MusicFrameProps {
	url: string;
	index: number;
}

export function MusicFrame({ url, index }: MusicFrameProps) {
	return (
		<iframe
			style={{ borderRadius: '20px', backgroundColor: 'black', marginTop: 25, marginLeft: 0 }}
			src={url}
			width="80%"
			height="352"
			frameBorder="0"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
		/>
	);
}

export function MusicFrameAlbum({ url, index }: MusicFrameProps) {
	return (
		<iframe
			style={{ borderRadius: '20px', backgroundColor: 'black', marginTop: 25, marginLeft: 0 }}
			src={url}
			width="109%"
			height="352"
			frameBorder="0"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
		/>
	);
}
