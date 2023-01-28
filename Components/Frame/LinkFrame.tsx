import { Box, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';

export interface LinkFrameProps {
	title: string;
	url: string;
	icon: any;
}

export function LinkFrame({ title, url, icon }: LinkFrameProps) {
	let { hovered, ref } = useHover();

	let outShadow = '0 0 0 0 rgba(0,0,0, .3)';
	let outShadowHover = '0 10px 100px rgba(255,255,255, .1)';
	let inShadow = 'inset 0 0 0 2px rgba(0,0,0, .3)';
	let inShadowHover = 'inset 0 0 0 2px rgba(255,255,255, .3)';

	let inset = {
		translate: 'translateY(0)',
		transition: 'all 0.5s ease',
		transform: 'translateY(0)',
		boxShadow: inShadow + ', ' + outShadow,
	};

	if (hovered) {
		inset = {
			translate: 'translateY(0)',
			transform: 'translateY(-10px)',
			transition: 'all 0.5s ease',
			boxShadow: inShadowHover + ', ' + outShadowHover,
		};
	}

	return (
		<Box
			onClick={() => {
				window.open(url, '_blank');
			}}
			style={{
				cursor: 'pointer',
				marginTop: 25,
				marginLeft: 30,
			}}
		>
			<Box
				ref={ref}
				style={{
					borderRadius: 10,
					backgroundColor: 'black',
					padding: 10,
					width: 200,
					height: 200,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',

					...inset,
				}}
			>
				{icon}
				<Text
					style={{ marginTop: 10, color: 'white', fontFamily: 'Indie Flower, cursive', fontWeight: 500, fontSize: 20 }}
				>
					{title}
				</Text>
			</Box>
		</Box>
	);
}
