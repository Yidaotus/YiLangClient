import './DictEntryWithEdit.css';
import React, { useCallback, useRef, useState } from 'react';
import { useDeleteDictionaryEntry } from '@hooks/DictionaryQueryHooks';
import { Button, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import DictionaryEntry, { IDictionaryEntryProps } from '../DictionaryEntry';
import DictEntryEdit, { IWordInputRef } from '../DictEntryEdit/DictEntryEdit';

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
		<div className="entry-with-edit-container">
			{!editing && (
				<div className="entry-with-edit-controlls-top">
					<IconButton
						onClick={() => setEditing((editState) => !editState)}
					>
						<EditIcon />
					</IconButton>
					{canRemove && (
						<IconButton onClick={remove}>
							<DeleteIcon />
						</IconButton>
					)}
				</div>
			)}
			{editing && (
				<div>
					<DictEntryEdit entryKey={entry} ref={dictEntryEdit} />
					<div className="entry-with-edit-controlls-bottom">
						<Button onClick={cancel}>Cancel</Button>
						<Button onClick={finish}>Save</Button>
					</div>
				</div>
			)}
			{!editing && (
				<DictionaryEntry
					entry={entry}
					canLink={canLink}
					onRootSelect={onRootSelect}
					size={size}
				/>
			)}
		</div>
	);
};

export default DictEntryWithEdit;
