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
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import SRSCard from './SRSCard';

type SRSAnswer = 'Again' | 'Good' | 'Easy';

const LEARNED_TARGET = 1 as const;
const INITIAL_MEMORY_VALUE = 0;
const SELECTION_RANDOMNESS = 0.05; //5%

const SRSFactorMap: Record<SRSAnswer, number> = {
	Again: -(LEARNED_TARGET / 2),
	Good: LEARNED_TARGET / 2,
	Easy: LEARNED_TARGET / 1,
} as const;

type CalculateIndexResult<T> = { done: true } | { done: false; nextItem: T };

function calculateNextIndex<T>(
	memoryMap: Map<T, number>,
	activeItem: T
): CalculateIndexResult<T> {
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
			entryId !== activeItem
	);
	let nextItem: T;
	if (entriesInThreshold.length > 0) {
		const randomIndexInThreshold = Math.floor(
			Math.random() * entriesInThreshold.length
		);
		nextItem = entriesInThreshold[randomIndexInThreshold][0];
	} else {
		// Fallback to the lowest rated entry
		nextItem = sortedEntries[0][0];
	}
	return { done: false, nextItem };
}

export type CardRenderer<T> = React.FC<{ item: T; side: 'Front' | 'Back' }>;
const BasicSRS = <T extends unknown>({
	items,
	itemRenderer: ItemRenderer,
	finished,
}: {
	items: Array<T>;
	itemRenderer: CardRenderer<T>;
	finished: () => void;
}) => {
	const [cardFace, setCardFace] = useState<'Front' | 'Back'>('Front');
	const [activeItem, setActiveItem] = useState<T>();
	const [memoryMap, setMemoryMap] = useState<Map<T, number>>(new Map());
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.focus();
		}
	}, [containerRef]);

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * items.length);
		const randomItem = items[randomIndex];

		const newMemoryMap = new Map<T, number>();
		for (const entry of items) {
			newMemoryMap.set(entry, INITIAL_MEMORY_VALUE);
		}
		setMemoryMap(newMemoryMap);
		setCardFace('Front');
		setActiveItem(randomItem);
	}, [items]);

	const answerCard = useCallback(
		(answer: SRSAnswer) => {
			if (cardFace === 'Back') {
				if (!activeItem) {
					return;
				}
				const learnFactor = SRSFactorMap[answer];
				const currentMemory = memoryMap.get(activeItem) || 0;
				const newMemoryMap = new Map([
					...memoryMap,
					[
						activeItem,
						Math.min(currentMemory + learnFactor, LEARNED_TARGET),
					],
				]);
				setMemoryMap(newMemoryMap);
				const nextEntryResult = calculateNextIndex(
					newMemoryMap,
					activeItem
				);
				if (nextEntryResult.done) {
					finished();
					// Callback
				} else {
					setActiveItem(nextEntryResult.nextItem);
					setCardFace('Front');
				}
			}
		},
		[activeItem, cardFace, finished, memoryMap]
	);

	const showAnswer = useCallback(() => {
		if (cardFace === 'Front') {
			setCardFace('Back');
		}
	}, [cardFace]);

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

	let cardActions = null;
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
		<Card
			onKeyPress={keyboardHandler}
			tabIndex={0}
			ref={containerRef}
			sx={{ width: '100%' }}
		>
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
					<SRSCard side={cardFace}>
						{activeItem && (
							<ItemRenderer item={activeItem} side={cardFace} />
						)}
					</SRSCard>
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
