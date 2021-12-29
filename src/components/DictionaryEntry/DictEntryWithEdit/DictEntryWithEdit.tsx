import './DictEntryWithEdit.css';
import React, { useCallback, useRef, useState } from 'react';
import { useDeleteDictionaryEntry } from '@hooks/DictionaryQueryHooks';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { Button, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import DictionaryEntry from '../DictionaryEntry';
import DictEntryEdit, { IWordInputRef } from '../DictEntryEdit/DictEntryEdit';

type IDictEntryWithEditProps = {
	dictEntry: IDictionaryEntryResolved;
	canLink?: boolean;
	canRemove?: boolean;
	removeCallback?: () => void;
};

const DictEntryWithEdit: React.FC<IDictEntryWithEditProps> = ({
	dictEntry,
	canLink,
	canRemove,
	removeCallback,
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
		await deleteEntry.mutateAsync(dictEntry.id);
		removeCallback?.();
	}, [deleteEntry, dictEntry.id, removeCallback]);

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
					<DictEntryEdit entryKey={dictEntry} ref={dictEntryEdit} />
					<div className="entry-with-edit-controlls-bottom">
						<Button onClick={cancel}>Cancel</Button>
						<Button onClick={finish}>Save</Button>
					</div>
				</div>
			)}
			{!editing && (
				<DictionaryEntry entry={dictEntry} canLink={canLink} />
			)}
		</div>
	);
};

export default DictEntryWithEdit;
