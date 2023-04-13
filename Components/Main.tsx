import { Box, Button, Center, Container, Divider, Flex, MediaQuery, Space, Text, Transition } from '@mantine/core';
import { ReactElement, useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Modal } from './Modal';

export function Main({ opened, setOpened }: { opened: boolean; setOpened: any }) {
	let router = useRouter();
	let { page } = router.query;

	let [transition, setTransition] = useState(false);
	let [model, setModel] = useState(0);
	const buttons = [
		{
			title: 'About',
			transition: transition,
			setTransition: setTransition,
		},
		{
			title: 'Projects',
			transition: transition,
			setTransition: setTransition,
		},
		{
			title: 'Music',
			transition: transition,
			setTransition: setTransition,
		},
		{
			title: 'Links',
			transition: transition,
			setTransition: setTransition,
		},
	];

	useEffect(() => {
		let id = page as string;

		if (id) {
			// check if the id is in the buttons.title
			buttons.forEach((button) => {
				if (button.title.toLowerCase() == id) {
					let page = 0;

					switch (id) {
						case 'about':
							page = 0;
							break;
						case 'projects':
							page = 1;
							break;
						case 'music':
							page = 2;
							break;
						case 'links':
							page = 3;
							break;
						default:
							page = 0;
							break;
					}

					setModel(parseInt(page.toString()));
					setOpened(true);
					setTransition(true);
					return;
				}
			});
		}
	}, [page, buttons]);

	let font = 'Barlow, sans-serif',
		title = 'Nitya Naman',
		subtitle = 'A Developer, Producer and Student';

	return (
		<>
			<MediaQuery
				smallerThan={'sm'}
				styles={(theme) => ({
					marginTop: '100px',
				})}
			>
				<Box mt={80}>
					<Center>
						<Modal setTransition={setTransition} model={model} transition={transition} setOpened={setOpened} />
					</Center>

					{/* Title */}
					<Transition mounted={!transition} transition={'pop'} duration={700} timingFunction={'ease'}>
						{(styles) => (
							<>
								<Container style={{ ...styles, color: 'white' }}>
									<MediaQuery
										smallerThan={'sm'}
										styles={(theme) => ({
											marginTop: '50px',
										})}
									>
										<Center style={styles}>
											<Divider color={'white'} h={50} mb={0} mt={-50} w={400} />
										</Center>
									</MediaQuery>

									<Center style={styles}>
										<Divider pos="absolute" color={'white'} h={50} mt={350} w={400} />
									</Center>

									<Center>
										<Text
											id="Title"
											mt={-25}
											style={{ fontSize: 55, fontFamily: 'Rajdhani, sans-serif', fontWeight: 300, color: 'white' }}
										// tt="uppercase"
										>
											{title}
										</Text>
									</Center>
									<Center>
										<Text
											id="Subtitle"
											style={{
												fontSize: 20,
												fontFamily: 'Indie Flower, cursive',
												marginTop: 20,
												fontWeight: 100,
												color: 'whtie',
											}}
										// tt="uppercase"
										>
											{subtitle}
										</Text>
									</Center>

									<Space h={100} />

									{/* Buttons */}
									<Flex mih={50} gap="md" justify="center" align="center" direction="row" wrap="wrap">
										{buttons.map((button) => (
											<Button
												onClick={() => {
													setTransition(true);
													setModel(buttons.indexOf(button));
													setOpened(true);
												}}
												style={{ color: 'white', fontFamily: font }}
												variant="subtle"
												size="lg"
												radius="md"
												color={'gray'}
												key={buttons.indexOf(button)}
											>
												{button.title}
											</Button>
										))}
									</Flex>
								</Container>
							</>
						)}
					</Transition>
				</Box>
			</MediaQuery>
		</>
	);
}
