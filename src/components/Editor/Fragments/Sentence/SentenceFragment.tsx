import React from 'react';
import { RenderElementProps, useSelected } from 'slate-react';
import { SentenceElement } from '@components/Editor/YiEditor';
import {
	ClickAwayListener,
	styled,
	Tooltip,
	tooltipClasses,
	TooltipProps,
	Zoom,
} from '@mui/material';

const SentenceTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.secondary.light,
		maxWidth: 500,
		marginTop: '5px !important',
		color: 'rgba(0, 0, 0, 0.87)',
		fontSize: theme.typography.pxToRem(14),
		border: `1px solid ${theme.palette.secondary.dark}`,
	},
}));

export type SentenceFragmentProps = Omit<RenderElementProps, 'element'> & {
	element: SentenceElement;
};
const SentenceFragment: React.FC<SentenceFragmentProps> = ({
	children,
	element,
	attributes,
}) => {
	const selected = useSelected();
	const [open, setOpen] = React.useState(false);

	const handleTooltipClose = () => {
		setOpen(false);
	};

	const handleTooltipOpen = () => {
		setOpen(true);
	};

	return (
		<span
			{...attributes}
			style={{
				borderBottom: '1px dashed #8DA46E',
			}}
		>
			<ClickAwayListener onClickAway={handleTooltipClose}>
				<div style={{ display: 'inline-block' }}>
					<SentenceTooltip
						title={element.translation}
						TransitionComponent={Zoom}
						enterDelay={300}
						PopperProps={{
							disablePortal: true,
							contentEditable: false,
						}}
						onClose={handleTooltipClose}
						open={open}
						disableFocusListener
						disableHoverListener
						disableTouchListener
					>
						<span
							style={{
								borderRadius: '2px',
								backgroundColor: selected ? '#d4ecff' : '',
							}}
							onClick={handleTooltipOpen}
						>
							{children}
						</span>
					</SentenceTooltip>
				</div>
			</ClickAwayListener>
		</span>
	);
};

export default SentenceFragment;
