import './DictionaryEntry.css';
import React from 'react';
import { IDictionaryEntry } from 'Document/Dictionary';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';

type IDictEntryProps = {
	entry: IDictionaryEntry;
	canLink?: boolean;
};

const DictionaryRootEntry: React.FC<IDictEntryProps> = (props) => {
	const { entry, canLink } = props;
	const navigate = useNavigate();

	return (
		<>
			{entry && (
				<div className="dictentry-panel">
					<div className="dictentry-head">
						{canLink ? (
							<h1 className="dictentry-head-item">
								<Button
									onClick={() => {
										navigate(
											`/home/dictionary/${entry.id}`
										);
									}}
								>
									{entry.key}
								</Button>
								{entry.spelling && (
									<span>{entry.spelling}</span>
								)}
							</h1>
						) : (
							<h1 className="dictentry-head-item">
								{entry.key}
								{entry.spelling && (
									<span>{entry.spelling}</span>
								)}
							</h1>
						)}
					</div>
					<blockquote>{entry.comment}</blockquote>
					<p>{entry.translations.join(', ')}</p>
				</div>
			)}
		</>
	);
};

export default DictionaryRootEntry;
