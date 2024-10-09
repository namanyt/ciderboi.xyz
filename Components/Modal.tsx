import {
	Avatar,
	Box,
	Center,
	CloseButton,
	Grid,
	Image,
	MediaQuery,
	Paper,
	ScrollArea,
	SimpleGrid,
	Text,
	Title,
	Tooltip,
	Transition,
	useMantineTheme,
} from '@mantine/core';
import { CSSProperties, ReactElement, useEffect, useRef } from 'react';
import {
	IconBrandGithub,
	IconBrandSpotify,
	IconBrandInstagram,
	IconBrandTwitter,
	IconBrandSoundcloud,
	IconBrandYoutube,
} from '@tabler/icons-react';
import { MusicFrame, MusicFrameAlbum } from '@/Components/Frame/MusicFrame';
import { ProjectFrame } from '@/Components/Frame/ProjectFrame';
import { LinkFrame } from '@/Components/Frame/LinkFrame';
import { songs } from '@/public/songs.json';
import { projects } from '@/public/projects.json';

export interface ModalProps {
	transition: boolean;
	setTransition: any;
	model: number;
	setOpened?: any;
	opened: boolean;
}

export function Modal(props: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	let model = {
		title: <Title style={{ fontSize: 50 }}>blank title</Title>,
		body: <Text>blank body</Text>,
		img: '',
	};

	let TitleStyle: CSSProperties = {
		fontSize: 50,
		fontFamily: 'Barlow, sans-serif',
		marginTop: 40,
		marginLeft: 50,
		fontWeight: 300,
		textDecoration: 'underline',
		textDecorationColor: 'white',
		textDecorationThickness: 1,
		textUnderlineOffset: 10,
	};

	let BodyStyle: CSSProperties = {
		fontSize: 15,
		fontFamily: 'Raleway, sans-serif',
		marginRight: 50,
		textAlign: 'center',
	};

	// Define models based on props.model
	switch (props.model) {
		case 0:
			model.title = (
				<Title id="About-Title" style={TitleStyle}>
					About
				</Title>
			);
			model.body = (
				<>
					<Center>
						<Image
							src="/image/pfp.gif"
							style={{
								position: 'absolute',
								width: 150,
								zIndex: -10,
								marginTop: 200,
								boxShadow: '0 0 50px 10px rgba(0,0,0,1)',
							}}
							radius={30}
							alt="pfp"
						/>
					</Center>
					<Text id="About-Body" ml={50} style={{ marginTop: 250, ...BodyStyle }}>
						I am Nitya Naman and I'm a 12th grader from Delhi Public School, Jaipur. I'm passionate about technology and
						have been actively developing web applications since the last two years. Recently, I've also started
						exploring music production on Spotify.
					</Text>
					<Text id="About-Body" ml={50} mt={20} style={BodyStyle}>
						I'm very excited to learn more about the opportunities available in this field. I'm confident that my
						knowledge in development and music production can be quite useful in achieving success in this industry.
					</Text>
				</>
			);
			break;
		case 1:
			model.title = (
				<>
					<Tooltip withArrow label={'Github'}>
						<Avatar
							src={'https://avatars.githubusercontent.com/u/69317068?v=4'}
							radius={'xl'}
							style={{
								position: 'absolute',
								right: 50,
								top: 25,
							}}
							component="a"
							href={'/github'}
						/>
					</Tooltip>
					<Title id="Projects-Title" style={TitleStyle}>
						Projects
					</Title>
				</>
			);

			model.body = (
				<>
					<MediaQuery smallerThan={'sm'} styles={{ height: '80vh' }}>
						<ScrollArea h={400} w={800} mt={50}>
							{projects.map((project) => {
								return (
									<ProjectFrame
										key={project.title}
										title={project.title}
										description={project.description}
										category={project.category}
										image={project.image}
										alt={project.id}
										tags={project.tags ? project.tags : []}
										url={project.url}
									/>
								);
							})}
						</ScrollArea>
					</MediaQuery>
				</>
			);
			break;
		case 2:
			let list = [...songs];

			model.title = (
				<Title id="Music-Title" style={TitleStyle}>
					Music
				</Title>
			);
			model.body = (
				<>
					<MediaQuery smallerThan={'sm'} styles={(theme) => ({ height: '80vh', width: '50vh' })}>
						<ScrollArea h={400} w={675} mt={50} ml={100}>
							<Grid h="100%" w={'100%'}>
								{list.reverse().map((song, i) => {
									if (song.type == 'song')
										return (
											<Grid.Col span={6}>
												<MusicFrame key={song.title} url={song.url} index={i} />
											</Grid.Col>
										);
									else if (song.type == 'album')
										return (
											<Grid.Col span={10}>
												<MusicFrameAlbum key={song.title} url={song.url} index={i} />
											</Grid.Col>
										);
								})}
							</Grid>
						</ScrollArea>

						{/* <ScrollArea h={400} w={675} mt={50} ml={100}>
							{list.reverse().map((song, i) => {
								if (song.type == 'song') return <MusicFrame key={song.title} url={song.url} index={i} />;
								else if (song.type == 'album') return <MusicFrameAlbum key={song.title} url={song.url} index={i} />;
							})}
						</ScrollArea> */}
					</MediaQuery>
				</>
			);
			break;
		case 3:
			let links = [
				{
					title: 'Github',
					url: '/github',
					icon: <IconBrandGithub />,
				},
				{
					title: 'Spotify',
					url: '/spotify',
					icon: <IconBrandSpotify />,
				},
				{
					title: 'Instagram',
					url: '/instagram',
					icon: <IconBrandInstagram />,
				},
				{
					title: 'Twitter',
					url: '/twitter',
					icon: <IconBrandTwitter />,
				},
				{
					title: 'SoundCloud',
					url: '/soundcloud',
					icon: <IconBrandSoundcloud />,
				},
				{
					title: 'YouTube',
					url: '/youtube',
					icon: <IconBrandYoutube />,
				},
			];

			model.title = (
				<Title id="Links-Title" style={TitleStyle}>
					Links
				</Title>
			);
			model.body = (
				<>
					<MediaQuery smallerThan={768} styles={{ height: '80vh', marginLeft: 25 }}>
						<ScrollArea h={600} ml={0} mt={0}>
							<SimpleGrid cols={window.innerWidth <= 992 ? 2 : 3} verticalSpacing="xs">
								{links.map((link) => {
									return <LinkFrame key={link.title} title={link.title} url={link.url} icon={link.icon} />;
								})}
							</SimpleGrid>
						</ScrollArea>
					</MediaQuery>
				</>
			);
			break;
	}

	// Handle closing modal on Escape key press
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				props.setTransition(false);
				props.setOpened(false);
			}
		};
		window.addEventListener('keydown', handleEsc);
		return () => {
			window.removeEventListener('keydown', handleEsc);
		};
	}, [props]);

	// Handle closing modal on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
				props.setTransition(false);
				props.setOpened(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [props]);

	return (
		<Transition mounted={props.transition} transition="slide-up" duration={700} timingFunction="ease">
			{(styles) => (
				<MediaQuery
					smallerThan="sm"
					styles={{
						backgroundColor: 'rgba(0,0,0,0.6)',
						position: 'absolute',
						zIndex: 100,
						width: '100%',
						height: '100%',
						top: 0,
						left: 0,
					}}
				>
					<Paper
						w={800}
						h={600}
						mt={200}
						ref={modalRef}
						style={{ ...styles }}
						sx={(theme) => ({
							backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.white,
							position: 'absolute',
							zIndex: 100,
							borderRadius: 10,
							boxShadow: '0 0 50px 0 rgba(0, 0, 0, .3)',
						})}
					>
						<CloseButton
							style={{ position: 'absolute', top: 0, right: 0, zIndex: 1000, marginTop: 10, marginRight: 10 }}
							onClick={() => {
								props.setTransition(false);
								props.setOpened(false);
							}}
						/>
						<Box pos="relative">
							{model.title}
							{model.body}
						</Box>
					</Paper>
				</MediaQuery>
			)}
		</Transition>
	);
}
