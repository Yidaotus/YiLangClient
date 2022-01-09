import './Dialog.css';
import React from 'react';
import { IDialogBlock } from 'Document/Block';
import { Box } from '@mui/material';

/**
 * Renders a dialog.
 *
 * @param lines the lines of the given dialog. Each line is rendered as a
 *				seperate RenderableString.
 */
const DialogBlock: React.FC<IDialogBlock> = ({
	lines,
	fragmentables,
	children,
}) => {
	return (
		<div className="dialog-block">
			{lines.map((line) => {
				const hasSpellableWords = false;
				const fragmentable = fragmentables.find(
					(f) => f.id === line.speech
				);
				return fragmentable ? (
					<div
						key={line.speech}
						style={{
							marginTop: `${hasSpellableWords ? '0.2em' : '0em'}`,
						}}
					>
						<Box
							sx={(theme) => ({
								backgroundColor: theme.palette.primary.main,
							})}
						>
							{line.speaker}
						</Box>
						<Box>{children}</Box>
					</div>
				) : null;
			})}
		</div>
	);
};

/*
const DialogBlockDefinition = createBlockDefinition({
	type: 'Dialog',
	block: DialogBlock,
	configurators: [],
	render: (block) => <DialogBlock {...block} />,
	parse: (content, position) => {
		const contentLines = content.split('\n').map((line) => {
			const splits = line.split(':');
			if (splits.length !== 2) {
				const error = new Error(
					`Input doesn't match the required format. Please enter a Dialog in the form of : 'speaker : speech' seperated by new lines!`
				);
				error.name = 'Malformed input!';
				throw error;
			}
			const speaker = line.split(':')[0];
			const speech = line.split(':')[1];
			return {
				speaker,
				speech,
			};
		});
		const lines: IDialogBlockLine[] = [];
		const fragmentables: Array<IFragmentableString> = [];
		for (const line of contentLines) {
			const speech = line.speech.trim();
			const speaker = line.speaker.trim();
			const fragmentable = FragmentableString(speech);
			lines.push({ speaker, speech: fragmentable.id });
			fragmentables.push(fragmentable);
		}

		return {
			type: 'Dialog',
			id: getstring(),
			lines,
			fragmentables,
			position,
			config: undefined,
		};
	},
});
*/

export default DialogBlock;
