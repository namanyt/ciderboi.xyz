import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';
import { AppShell, BackgroundImage, Box, Center, Container, MediaQuery, Transition } from '@mantine/core';
import { Main } from '@/Components/Main';
import { useState } from 'react';

export default function Home() {
	let width = 600,
		height = 400;

	let [opened, setOpened] = useState(false);

	return (
		<>
			<Head>
				<title>Nitya Naman</title>
			</Head>

			<BackgroundImage
				src="/image/bg.jpg"
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					filter: opened ? 'blur(10px) brightness(0.5) ' : 'blur(0px) brightness(0.6) grayscale(0.2)',

					transition: 'all 0.7s ease-in-out',
					transform: opened ? 'scale(1.1)' : 'scale(1)',
				}}
			/>

			<AppShell padding={0} style={{ top: 0, left: 0, width: '100%', height: '100%' }}>
				<Center style={{ width: '100%', height: '100%', position: 'fixed' }}>
					<MediaQuery
						smallerThan={'sm'}
						styles={(theme) => ({
							width: 400,
							height: 600,
						})}
					>
						<Box w={width} h={height}>
							<Transition mounted={!opened} transition={'fade'} duration={700} timingFunction={'ease'}>
								{(style) => (
									<MediaQuery
										smallerThan={'sm'}
										styles={(theme) => ({
											width: 400,
											height: 600,
										})}
									>
										<Box
											w={width}
											h={height}
											style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 50, filter: 'blur(5px)', ...style }}
											pos="absolute"
										/>
									</MediaQuery>
								)}
							</Transition>
							<Main opened={opened} setOpened={setOpened} />
						</Box>
					</MediaQuery>
				</Center>

				{/* footer */}
				<Box
					style={{
						position: 'absolute',
						bottom: 15,
						left: 0,
						width: '100%',
						height: 'auto',
						fontFamily: 'Indie Flower, cursive',
					}}
				>
					<Center>©️ 2024 Nitya Naman | Cider Boi</Center>
				</Box>
			</AppShell>
		</>
	);
}
