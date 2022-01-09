import './Settings.css';
import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import LanguageConfigPanel from './LanguageConfig/LanguageConfig';
import EditorConfigPanel from './EditorConfig/EditorConfig';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

const TabPanel = (props: TabPanelProps) => {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`vertical-tabpanel-${index}`}
			aria-labelledby={`vertical-tab-${index}`}
			style={{ width: '100%' }}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
};

const a11yProps = (index: number) => ({
	id: `vertical-tab-${index}`,
	'aria-controls': `vertical-tabpanel-${index}`,
});

const Settings: React.FC = () => {
	const [value, setValue] = React.useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};
	return (
		<Box
			sx={{
				flexGrow: 1,
				bgcolor: 'background.paper',
				display: 'flex',
				width: '100%',
			}}
		>
			<Tabs
				orientation="vertical"
				variant="scrollable"
				value={value}
				onChange={handleChange}
				aria-label="Vertical tabs example"
				sx={{ borderRight: 1, borderColor: 'divider' }}
			>
				<Tab label="Account" {...a11yProps(0)} />
				<Tab label="Editor" {...a11yProps(1)} />
				<Tab label="Languages" {...a11yProps(2)} />
			</Tabs>
			<TabPanel value={value} index={0}>
				<span>Account</span>
			</TabPanel>
			<TabPanel value={value} index={1}>
				<EditorConfigPanel />
			</TabPanel>
			<TabPanel value={value} index={2}>
				<LanguageConfigPanel />
			</TabPanel>
		</Box>
	);
};

export default Settings;
