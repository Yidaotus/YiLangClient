/* eslint-disable react/destructuring-assignment */
import './DictEntryWithEdit.css';
import React, { useCallback, useRef, useState } from 'react';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { useDeleteDictionaryEntry } from '@hooks/DictionaryQueryHooks';
import { Popover2 } from '@blueprintjs/popover2';
import { Button, Intent, Menu, MenuItem } from '@blueprintjs/core';
import DictionaryEntry from '../DictionaryEntry';
import DictEntryEdit, { IWordInputRef } from '../DictEntryEdit/DictEntryEdit';

type IDictEntryWithEditProps = {
	dictEntry: IDictionaryEntryResolved;
	root?: IDictionaryEntryResolved;
	canLink?: boolean;
	canRemove?: boolean;
};

const DictEntryWithEdit: React.FC<IDictEntryWithEditProps> = (props) => {
	const { dictEntry, canLink, canRemove, root } = props;
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
	}, [deleteEntry, dictEntry.id]);

	const moreDropdown = (
		<Menu>
			<MenuItem
				key="1"
				icon="edit"
				onClick={() => setEditing((editState) => !editState)}
				text="Edit"
			/>
			<MenuItem
				key="2"
				icon="delete"
				onClick={remove}
				intent={Intent.DANGER}
				text="Remove"
			/>
		</Menu>
	);

	return (
		<div className="entry-with-edit-container">
			<div className="entry-with-edit-controlls-top">
				{canRemove ? (
					<Popover2 content={moreDropdown} placement="bottom">
						<Button minimal outlined icon="more" />
					</Popover2>
				) : (
					<Button
						minimal
						outlined
						icon="edit"
						onClick={() => setEditing((editState) => !editState)}
					/>
				)}
			</div>
			{editing && (
				<div>
					<DictEntryEdit
						entryKey={dictEntry}
						ref={dictEntryEdit}
						root={root}
					/>
					<div className="entry-with-edit-controlls-bottom">
						<Button onClick={cancel} icon="stop">
							Cancel
						</Button>
						<Button onClick={finish} icon="floppy-disk">
							Save
						</Button>
					</div>
				</div>
			)}
			{!editing && (
				<DictionaryEntry entryId={dictEntry.id} canLink={canLink} />
			)}
		</div>
	);
};

export default DictEntryWithEdit;
