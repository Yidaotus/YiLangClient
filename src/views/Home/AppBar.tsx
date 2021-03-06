import * as React from 'react';
import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Typography,
	Menu,
	Container,
	Avatar,
	Tooltip,
	MenuItem,
	Tabs,
	Tab,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import SettingsPopover from '@components/SettingsPopover/SettingsPopover';
import { Link, matchRoutes } from 'react-router-dom';
import { useActiveDocument, useUserContext } from '@hooks/useUserContext';
import { useLocation } from 'react-router';

const pages = ['Products', 'Pricing', 'Blog'];

const ResponsiveAppBar: React.FC = () => {
	const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
		null
	);
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
		null
	);
	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget);
	};
	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};
	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};
	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};
	const user = useUserContext();
	const location = useLocation();
	const matchedRoutes = matchRoutes(
		[
			{ path: '/' },
			{ path: 'editor/:id' },
			{ path: 'dictionary' },
			{ path: 'dictionary/:id' },
			{ path: 'documents' },
		],
		location,
		'/home'
	);
	const matchedPath = matchedRoutes?.[0].route.path || null;
	const [activeDocumentId] = useActiveDocument();

	return (
		<AppBar
			position="absolute"
			sx={(theme) => ({
				backgroundColor: theme.palette.primary.main,
			})}
		>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Box sx={{ mr: 2, display: 'flex' }}>
						<Link to="/home">
							<img
								alt="YiLang.png"
								src="/yilang-logo.png"
								style={{
									objectFit: 'contain',
									width: '100px',
									height: '45px',
								}}
							/>
						</Link>
					</Box>

					<Box
						sx={{
							flexGrow: 1,
							display: 'flex',
						}}
					>
						<Tabs value={matchedPath}>
							<Tab
								label="Editor"
								value="editor/:id"
								to={`editor/${activeDocumentId}`}
								component={Link}
								disabled={!!!activeDocumentId}
							/>
							<Tab
								label="Dictionary"
								value="dictionary"
								to="dictionary"
								component={Link}
							/>
							<Tab
								label="Documents"
								value="documents"
								to="documents"
								component={Link}
							/>
						</Tabs>
					</Box>

					<Box sx={{ flexGrow: 0 }}>
						<Tooltip title="Open settings">
							<IconButton
								onClick={handleOpenUserMenu}
								sx={{ p: 0 }}
							>
								<Avatar
									alt={user?.username}
									src="/static/images/avatar/2.jpg"
								/>
							</IconButton>
						</Tooltip>
						<Menu
							sx={{ mt: '45px' }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={!!anchorElUser}
							onClose={handleCloseUserMenu}
							closeAfterTransition
						>
							<SettingsPopover />
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};
export default ResponsiveAppBar;
