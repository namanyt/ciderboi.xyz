import { Badge, Button, Card, createStyles, Group, Image, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { useHover } from '@mantine/hooks';

export interface ProjectFrameProps {
	image: string;
	category: string;
	title: string;
	description: string;
	tags: string[] | null;
	url: string;
	alt: string;
}

export function ProjectFrame({ image, alt, category, title, description, tags, url }: ProjectFrameProps) {
	let { hovered, ref } = useHover();

	const useStyles = createStyles((theme) => ({
		card: {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
			borderRadius: 10,
			transition: 'box-shadow 0.5s ease',
			boxShadow: hovered ? '0 0 50px 10px rgba(255, 255, 255, .1)' : '0 0 0px 0 rgba(0, 0, 0, .1)',
		},

		title: {
			fontWeight: 700,
			fontFamily: `Greycliff CF, ${theme.fontFamily}`,
			lineHeight: 1.2,
		},

		body: {
			padding: theme.spacing.md,
		},
	}));
	const { classes } = useStyles();

	return (
		<Card withBorder radius="md" w={600} ml={100} mt={50} ref={ref} p={0} className={classes.card} mb={25}>
			<Group spacing={0}>
				<Image
					src={image}
					height={140}
					width={140}
					ml={15}
					sx={(theme) => ({
						borderRadius: theme.radius.md,
						boxShadow: '0 0 50px 10px rgba(0, 0, 0, .5)',
					})}
					radius={'md'}
					withPlaceholder
					placeholder={<Text align="center">{title}</Text>}
				/>
				<div className={classes.body}>
					<Text transform="uppercase" color="dimmed" weight={700} size="xs">
						{category}
					</Text>
					<Text className={classes.title} mt="xs" mb="xs">
						{title}
					</Text>
					<Text color="dimmed" ff={'Rajdhani, sans-serif'} fw={600} size="sm" mb={'md'}>
						{description}
					</Text>
					{tags && (
						<Group noWrap spacing="xs" mb={20}>
							{tags.map((tag) => (
								<Badge key={tag} variant="light" color="gray">
									{tag}
								</Badge>
							))}
						</Group>
					)}
					<Button
						size="sm"
						radius={'md'}
						color={'gray'}
						variant="filled"
						leftIcon={<IconExternalLink size={15} />}
						onClick={() => {
							window.open(url, '_blank');
						}}
					>
						View
					</Button>
				</div>
			</Group>
		</Card>
	);
}
