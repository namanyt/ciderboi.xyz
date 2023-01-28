interface MusicFrameProps {
	url: string;
	index: number;
}

export function MusicFrame({ url, index }: MusicFrameProps) {
	return (
		<iframe
			style={{ borderRadius: '20px', backgroundColor: 'black', marginTop: 25, marginLeft: index % 2 == 0 ? 0 : 50 }}
			src={url}
			width="40%"
			height="352"
			frameBorder="0"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
		/>
	);
}
