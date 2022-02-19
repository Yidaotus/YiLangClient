import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	useListDictionaryEntries,
	useListDictionarySentences,
} from '@hooks/DictionaryQueryHooks';
import {
	Backdrop,
	Box,
	Card,
	CircularProgress,
	Divider,
	Paper,
	Stack,
	Table,
	TableBody,
	TableContainer,
} from '@mui/material';
import { useListDocuments } from '@hooks/DocumentQueryHooks';
import DictionaryEntryRow from '@components/DictionaryEntry/DictionaryEntryRow';
import DictionarySentenceRow from '@components/DictionaryEntry/DictionarySentenceRow';
import Documents from '../Documents/Documents';
import PageHeader from '@components/PageHeader/PageHeader';

// const excerptsToLoad = 3;
const Overview: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const [loadingEntries, latestDictionaryEntries] = useListDictionaryEntries({
		limit: 5,
		skip: 0,
		sortBy: {
			key: 'createdAt',
			order: 'descend',
		},
		excerptLength: 80,
	});

	const [loadingSentences, latestDictionarySentences] =
		useListDictionarySentences({
			limit: 5,
			skip: 0,
			sortBy: {
				key: 'createdAt',
				order: 'descend',
			},
		});

	const [loadingDocuments, latestDocuments] = useListDocuments({
		limit: 5,
		skip: 0,
		sortBy: 'createdAt',
		excerptLength: 80,
	});

	const fetchDocumentAndSwitch = useCallback(
		(id: string) => {
			navigate(`/home/editor/${id}`);
		},
		[navigate]
	);

	return (
		<div>
			<Backdrop open={!!loading}>
				<CircularProgress color="inherit" />
			</Backdrop>
			<Box sx={{ display: 'flex', flexDirection: 'column' }}>
				<Stack spacing={1} direction="column">
					<Card sx={{ p: 1 }}>
						<PageHeader
							title="Latest Dictionary Entries"
							subtitle="Dictionary entries you recently added"
						/>
						<TableContainer component={Paper} sx={{ mt: 2 }}>
							<Table
								sx={{ minWidth: 650 }}
								aria-label="simple table"
								size="small"
							>
								<TableBody>
									{latestDictionaryEntries.entries.map(
										(entry) => (
											<DictionaryEntryRow
												entryId={entry.id}
												key={entry.id}
											/>
										)
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Card>
					<Divider orientation="horizontal" flexItem />
					<Card sx={{ p: 1 }}>
						<PageHeader
							title="Latest Sentences"
							subtitle="Sentences you added recently"
						/>
						<TableContainer component={Paper} sx={{ mt: 2 }}>
							<Table
								sx={{ minWidth: 650 }}
								aria-label="simple table"
								size="small"
							>
								<TableBody>
									{latestDictionarySentences.sentences.map(
										(sentence) => (
											<DictionarySentenceRow
												id={sentence.id}
											/>
										)
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Card>
					<Divider orientation="horizontal" flexItem />
					<Card>
						<Documents />
					</Card>
				</Stack>
			</Box>
		</div>
	);
};

export default Overview;
