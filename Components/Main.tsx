import { Box, Button, Center, Container, Divider, Flex, MediaQuery, Space, Text, Transition } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Modal } from './Modal';

export function Main({ opened, setOpened }: { opened: boolean; setOpened: any }) {
	const router = useRouter();
	const { page } = router.query;

	const [transition, setTransition] = useState(false);
	const [model, setModel] = useState(0);

	const buttons = [
		{ title: 'About', id: 'about' },
		{ title: 'Projects', id: 'projects' },
		{ title: 'Music', id: 'music' },
		{ title: 'Links', id: 'links' },
	];

	// Function to open the modal based on the page
	const openModalByPage = (id: string) => {
		const buttonIndex = buttons.findIndex((button) => button.id === id);
		if (buttonIndex !== -1) {
			setModel(buttonIndex);
			setOpened(true);
			setTransition(true);
		}
	};

	// Effect to open modal based on the query parameter
	useEffect(() => {
		if (page) {
			openModalByPage(page as string);
		}
	}, [page]);

	// Handle closing modal with escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && opened) {
				setOpened(false);
				setTransition(false);
			}
		};
		window.addEventListener('keydown', handleEscape);

		return () => {
			window.removeEventListener('keydown', handleEscape);
		};
	}, [opened]);

	const font = 'Barlow, sans-serif',
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
						<Modal
							setTransition={setTransition}
							model={model}
							transition={transition}
							setOpened={setOpened}
							opened={opened}
						/>
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
