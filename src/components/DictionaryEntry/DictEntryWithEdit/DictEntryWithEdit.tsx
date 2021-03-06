import React, { useCallback, useEffect, useState } from 'react';
import { useDeleteDictionaryEntry } from '@hooks/DictionaryQueryHooks';
import { Box, Button, IconButton, Stack } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import DictionaryEntry, { IDictionaryEntryProps } from '../DictionaryEntry';
import DictEntryEdit from '../DictionaryEntryInput/DictionaryEntryInput';
import ConfirmButton from '@components/ConfirmButton/ConfirmButton';

type IDictEntryWithEditProps = IDictionaryEntryProps & {
	onStateChange?: (editing: boolean) => void;
	canRemove?: boolean;
	removeCallback?: () => void;
};

const DictEntryWithEdit: React.FC<IDictEntryWithEditProps> = ({
	entry,
	canLink,
	canRemove,
	removeCallback,
	size,
	onRootSelect,
	onStateChange,
}) => {
	const [editing, setEditing] = useState(false);
	const deleteEntry = useDeleteDictionaryEntry();

	useEffect(() => {
		onStateChange?.(editing);
	}, [onStateChange, editing]);

	const finish = () => {
		setEditing(false);
	};

	const cancel = () => {
		setEditing(false);
	};

	const remove = useCallback(async () => {
		await deleteEntry.mutateAsync(entry.id);
		removeCallback?.();
	}, [deleteEntry, entry.id, removeCallback]);

	return (
		<Box sx={{ display: 'flex', position: 'relative' }}>
			{editing && (
				<Box sx={{ width: '100%' }}>
					<DictEntryEdit
						entryKey={entry}
						onCancel={cancel}
						onFinish={finish}
					/>
				</Box>
			)}
			{!editing && (
				<DictionaryEntry
					entry={entry}
					canLink={canLink}
					onRootSelect={onRootSelect}
					size={size}
				/>
			)}
			{!editing && (
				<Box
					sx={{
						marginLeft: 'auto',
						position: 'absolute',
						top: 0,
						right: 0,
					}}
				>
					<Stack spacing={1} direction="row">
						<IconButton
							onClick={() =>
								setEditing((editState) => !editState)
							}
							size="small"
						>
							<EditIcon fontSize="small" />
						</IconButton>
						{canRemove && (
							<ConfirmButton
								onConfirm={remove}
								icon={<DeleteIcon />}
							/>
						)}
					</Stack>
				</Box>
			)}
		</Box>
	);
};

export default DictEntryWithEdit;
