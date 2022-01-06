import { useLookupSources } from '@hooks/ConfigQueryHooks';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Search } from '@mui/icons-material';
import React from 'react';
import { IDictionaryLookupSource } from 'Document/Config';

const formatURL = ({
	source,
	searchTerm,
}: {
	source: IDictionaryLookupSource;
	searchTerm: string;
}): string => source.source.replace('{}', searchTerm);
const WINDOW_TARGET = '_blank';

export interface ILookupSourceMenuProps {
	searchTerm: string;
}

const LookupSourceMenu: React.FC<ILookupSourceMenuProps> = ({ searchTerm }) => {
	const lookupSources = useLookupSources();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<IconButton
				id="lookup-button"
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				<Search />
			</IconButton>
			<Menu
				open={open}
				onClose={handleClose}
				anchorEl={anchorEl}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
			>
				{lookupSources.map((source) => (
					<MenuItem
						key={source.name}
						onClick={() => {
							const url = formatURL({
								source,
								searchTerm,
							});
							window.open(url, WINDOW_TARGET);
							handleClose();
						}}
					>
						{source.name}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LookupSourceMenu;
