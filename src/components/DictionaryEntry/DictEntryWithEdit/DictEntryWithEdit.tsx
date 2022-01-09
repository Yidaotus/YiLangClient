import './DictEntryWithEdit.css';
import React, { useCallback, useRef, useState } from 'react';
import { useDeleteDictionaryEntry } from '@hooks/DictionaryQueryHooks';
import { Box, Button, IconButton, Stack } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import DictionaryEntry, { IDictionaryEntryProps } from '../DictionaryEntry';
import DictEntryEdit, { IWordInputRef } from '../DictEntryEdit/DictEntryEdit';
import ConfirmButton from '@components/ConfirmButton/ConfirmButton';

type IDictEntryWithEditProps = IDictionaryEntryProps & {
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
}) => {
	const [editing, setEditing] = useState(false);
	const deleteEntry = useDeleteDictionaryEntry();
	const dictEntryEdit = useRef<IWordInputRef>(null);

	const finish = async () => {
		if (dictEntryEdit.current) {
			const editResult = await dictEntryEdit.current.finish();
			if (editResult.isDone) {
				setEditing(false);
			}
		}
	};

	const cancel = () => {
		if (dictEntryEdit.current) {
			const isDone = dictEntryEdit.current.cancel();
			if (isDone) {
				setEditing(false);
			}
		}
	};

	const remove = useCallback(async () => {
		await deleteEntry.mutateAsync(entry.id);
		removeCallback?.();
	}, [deleteEntry, entry.id, removeCallback]);

	return (
		<Box sx={{ display: 'flex' }}>
			{editing && (
				<Box sx={{ width: '100%' }}>
					<DictEntryEdit entryKey={entry} ref={dictEntryEdit} />
					<Box>
						<Button onClick={cancel}>Cancel</Button>
						<Button onClick={finish}>Save</Button>
					</Box>
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
				<Box sx={{ marginLeft: 'auto' }}>
					<Stack spacing={1} direction="row">
						<IconButton
							onClick={() =>
								setEditing((editState) => !editState)
							}
						>
							<EditIcon />
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
