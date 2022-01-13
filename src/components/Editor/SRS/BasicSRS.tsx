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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
	Good: LEARNED_TARGET / 2,
	Easy: LEARNED_TARGET / 1,
} as const;

type CalculateIndexResult =
	| { done: true }
	| { done: false; nextId: DictionaryEntryID };

const calculateNextIndex = (
	memoryMap: Map<DictionaryEntryID, number>,
	activeId: DictionaryEntryID
): CalculateIndexResult => {
	const sortedEntries = [...memoryMap.entries()].sort(
		([, memoryFactorA], [, memoryFactorB]) => memoryFactorA - memoryFactorB
	);
	const allDone = sortedEntries[0][1] >= LEARNED_TARGET;
	if (allDone) {
		return { done: true };
	}

	const [, lowestMemory] = sortedEntries[0];
	const selectionThreshold =
		lowestMemory + LEARNED_TARGET * SELECTION_RANDOMNESS;
	const entriesInThreshold = sortedEntries.filter(
		([entryId, memoryFactor]) =>
			memoryFactor < LEARNED_TARGET &&
			memoryFactor <= selectionThreshold &&
			entryId !== activeId
	);
	let nextId: DictionaryEntryID;
	if (entriesInThreshold.length > 0) {
		const randomIndexInThreshold = Math.floor(
			Math.random() * entriesInThreshold.length
		);
		nextId = entriesInThreshold[randomIndexInThreshold][0];
	} else {
		// Fallback to the lowest rated entry
		nextId = sortedEntries[0][0];
	}
	return { done: false, nextId };
};

const BasicSRS: React.FC<BasicSRSProps> = ({ entryIds }) => {
	const [cardFace, setCardFace] = useState<'Front' | 'Back'>('Front');
	const [srsState, setSRSState] = useState<SRSState>('Start');
	const [activeId, setActiveId] = useState<DictionaryEntryID | null>(null);
	const [memoryMap, setMemoryMap] = useState<Map<DictionaryEntryID, number>>(
		new Map()
	);

	useEffect(() => {
		setSRSState('Start');
		setCardFace('Front');
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
		setCardFace('Front');
		setSRSState('Running');
	};

	const answerCard = useCallback(
		(answer: SRSAnswer) => {
			if (srsState === 'Running' && cardFace === 'Back') {
				if (!activeId) {
					return;
				}
				const learnFactor = SRSFactorMap[answer];
				const currentMemory = memoryMap.get(activeId) || 0;
				const newMemoryMap = new Map([
					...memoryMap,
					[
						activeId,
						Math.min(currentMemory + learnFactor, LEARNED_TARGET),
					],
				]);
				setMemoryMap(newMemoryMap);
				const nextEntryResult = calculateNextIndex(
					newMemoryMap,
					activeId
				);
				if (nextEntryResult.done) {
					setActiveId(null);
					setSRSState('Finish');
				} else {
					setActiveId(nextEntryResult.nextId);
					setCardFace('Front');
				}
			}
		},
		[activeId, cardFace, memoryMap, srsState]
	);

	const showAnswer = useCallback(() => {
		if (srsState === 'Running' && cardFace === 'Front') {
			setCardFace('Back');
		}
	}, [cardFace, srsState]);

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
					Show Answer (Space)
				</Button>
			) : (
				<>
					<Button
						size="small"
						variant="outlined"
						onClick={() => answerCard('Again')}
					>
						Again (1)
					</Button>
					<Button
						size="small"
						variant="outlined"
						onClick={() => answerCard('Good')}
					>
						Good (2)
					</Button>
					<Button
						size="small"
						variant="outlined"
						onClick={() => answerCard('Easy')}
					>
						Easy (3)
					</Button>
				</>
			);
	}

	const keyboardHandler = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			switch (e.key) {
				case ' ':
					showAnswer();
					e.preventDefault();
					break;
				case '1':
					answerCard('Again');
					break;
				case '2':
					answerCard('Good');
					break;
				case '3':
					answerCard('Easy');
					break;
			}
		},
		[answerCard, showAnswer]
	);

	return (
		<Card onKeyPress={keyboardHandler} tabIndex={0}>
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
