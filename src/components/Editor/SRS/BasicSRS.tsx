import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	LinearProgress,
	Typography,
} from '@mui/material';
import { DictionaryEntryID } from 'Document/Utility';
import React, { useEffect, useMemo, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SRSCard from './SRSCard';

interface BasicSRSProps {
	entryIds: Array<DictionaryEntryID>;
}
type SRSAnswer = 'Again' | 'Good' | 'Easy';
type SRSState = 'Start' | 'Running' | 'Finish';

const LEARNED_TARGET = 1 as const;
const INITIAL_MEMORY_VALUE = 0;
const SELECTION_RANDOMNESS = 0.05; //5%

const SRSFactorMap: Record<SRSAnswer, number> = {
	Again: -(LEARNED_TARGET / 2),
	Good: LEARNED_TARGET / 3,
	Easy: LEARNED_TARGET / 2,
} as const;

const BasicSRS: React.FC<BasicSRSProps> = ({ entryIds }) => {
	const [cardFace, setCardFace] = useState<'Front' | 'Back'>('Front');
	const [srsState, setSRSState] = useState<SRSState>('Start');
	const [activeId, setActiveId] = useState<DictionaryEntryID | null>(null);
	const [memoryMap, setMemoryMap] = useState<Map<DictionaryEntryID, number>>(
		new Map()
	);

	useEffect(() => {
		setSRSState('Start');
	}, [entryIds]);

	const initializeMemoryMap = () => {
		const newMemoryMap = new Map<DictionaryEntryID, number>();
		for (const entryId of entryIds) {
			newMemoryMap.set(entryId, INITIAL_MEMORY_VALUE);
		}
		setMemoryMap(newMemoryMap);
	};

	const start = () => {
		const randomIndex = Math.floor(Math.random() * entryIds.length);
		const randomId = entryIds[randomIndex];
		initializeMemoryMap();
		setActiveId(randomId);
		setSRSState('Running');
	};

	const selectNextCard = () => {
		const sortedEntries = [...memoryMap.entries()].sort(
			([, memoryFactorA], [, memoryFactorB]) =>
				memoryFactorA - memoryFactorB
		);
		//are we done?
		const allDone = sortedEntries[0][1] >= LEARNED_TARGET;
		if (allDone) {
			setSRSState('Finish');
			setActiveId(null);
			return;
		}

		//sort
		const [, lowestMemory] = sortedEntries[0];
		const selectionThreshold =
			lowestMemory + LEARNED_TARGET * SELECTION_RANDOMNESS;
		const entriesInThreshold = sortedEntries.filter(
			([, memoryFactor]) =>
				memoryFactor < LEARNED_TARGET &&
				memoryFactor <= selectionThreshold
		);
		const randomIndexInThreshold = Math.floor(
			Math.random() * entriesInThreshold.length
		);

		const [nextEntryId] = entriesInThreshold[randomIndexInThreshold];
		setActiveId(nextEntryId);
		setCardFace('Front');
	};

	const answerCard = (answer: SRSAnswer) => {
		if (!activeId) {
			return;
		}
		const learnFactor = SRSFactorMap[answer];
		const currentMemory = memoryMap.get(activeId) || 0;
		setMemoryMap(
			new Map([
				...memoryMap,
				[
					activeId,
					Math.min(currentMemory + learnFactor, LEARNED_TARGET),
				],
			])
		);
		selectNextCard();
	};

	const showAnswer = () => {
		setCardFace('Back');
	};

	const progress = useMemo(() => {
		const currentMemoryEntries = [...memoryMap.entries()];
		const currentProgress = currentMemoryEntries.reduce(
			(progressValue, [, memoryValue]) => progressValue + memoryValue,
			0
		);
		const calculatedProgress =
			(currentProgress / (currentMemoryEntries.length * LEARNED_TARGET)) *
			100;
		return calculatedProgress;
	}, [memoryMap]);

	let cardContent;
	switch (srsState) {
		case 'Start':
			cardContent = (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Typography>Press start to begin</Typography>
					<Button size="small" variant="contained" onClick={start}>
						Start
					</Button>
				</Box>
			);
			break;
		case 'Running':
			cardContent = activeId ? (
				<SRSCard entryId={activeId} side={cardFace} />
			) : (
				<Typography>Impossible state?!</Typography>
			);
			break;
		case 'Finish':
			cardContent = <CheckCircleIcon fontSize="large" color="success" />;
			break;
		default:
			break;
	}

	let cardActions = null;
	if (activeId && srsState === 'Running') {
		cardActions =
			cardFace === 'Front' ? (
				<Button
					size="small"
					variant="contained"
					onClick={() => showAnswer()}
					sx={{ margin: 'auto' }}
				>
					Show Answer
				</Button>
			) : (
				<>
					<Button
						size="small"
						variant="outlined"
						onClick={() => answerCard('Again')}
					>
						Again
					</Button>
					<Button
						size="small"
						variant="outlined"
						onClick={() => answerCard('Good')}
					>
						Good
					</Button>
					<Button
						size="small"
						variant="outlined"
						onClick={() => answerCard('Easy')}
					>
						Easy
					</Button>
				</>
			);
	}

	return (
		<Card>
			<LinearProgress variant="determinate" value={progress} />
			<CardHeader>
				<Typography>SRS</Typography>
			</CardHeader>
			<CardContent>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '200px',
					}}
				>
					{cardContent}
				</Box>
			</CardContent>
			<CardActions>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						width: '100%',
						justifyContent: 'space-between',
					}}
				>
					{cardActions}
				</Box>
			</CardActions>
		</Card>
	);
};

export default BasicSRS;
