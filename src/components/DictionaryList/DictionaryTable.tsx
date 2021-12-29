import * as React from 'react';
import {
	Box,
	Link,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	Toolbar,
	Typography,
} from '@mui/material';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useListDictionaryEntries } from '@hooks/DictionaryQueryHooks';
import { useAllTags } from '@hooks/useTags';
import { IListDictionaryParams } from 'api/definitions/api';
import { IDictionaryEntry } from 'Document/Dictionary';
import { useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { visuallyHidden } from '@mui/utils';
import { useNavigate } from 'react-router';

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof IDictionaryEntry;
	label: string;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'key',
		disablePadding: false,
		label: 'Key',
	},
	{
		id: 'comment',
		disablePadding: false,
		label: 'Comment',
	},
	{
		id: 'spelling',
		disablePadding: false,
		label: 'Spelling',
	},
	{
		id: 'translations',
		disablePadding: false,
		label: 'Translations',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (
		event: React.MouseEvent<unknown>,
		property: keyof IDictionaryEntry
	) => void;
	order: Order;
	orderBy: string | null;
}

const EnhancedTableHead: React.FC<EnhancedTableProps> = ({
	order,
	orderBy,
	onRequestSort,
}) => {
	const createSortHandler =
		(property: keyof IDictionaryEntry) =>
		(event: React.MouseEvent<unknown>) => {
			onRequestSort(event, property);
		};

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						padding={headCell.disablePadding ? 'none' : 'normal'}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : 'asc'}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === 'desc'
										? 'sorted descending'
										: 'sorted ascending'}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
};

const EnhancedTableToolbar: React.FC = () => (
	<Toolbar
		sx={{
			pl: { sm: 2 },
			pr: { xs: 1, sm: 1 },
		}}
	>
		<Typography
			sx={{ flex: '1 1 100%' }}
			variant="h6"
			id="tableTitle"
			component="div"
		>
			Dictionary Entries
		</Typography>
		<span>Search TODO</span>
	</Toolbar>
);

const DictionaryTable: React.FC = () => {
	const [order, setOrder] = useState<Order>('asc');
	const [orderBy, setOrderBy] = useState<keyof IDictionaryEntry | null>(null);
	const [selected, setSelected] = useState<readonly string[]>([]);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [filter, setFilter] = useState<keyof IDictionaryEntry | null>(null);
	const selectedLanguage = useActiveLanguageConf();

	const paginationOptions = useMemo<IListDictionaryParams>(
		() => ({
			excerptLength: 80,
			lang: selectedLanguage?.id || 'jp',
			limit: pageSize,
			skip: page * pageSize,
			filter: {},
			sortBy: orderBy
				? {
						key: orderBy,
						order: order === 'asc' ? 'ascend' : 'descend',
				  }
				: undefined,
		}),
		[order, orderBy, page, pageSize, selectedLanguage?.id]
	);
	const [loading, paginatedEntries] =
		useListDictionaryEntries(paginationOptions);
	const tags = useAllTags();

	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: keyof IDictionaryEntry
	) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		if (!isAsc && orderBy === property) {
			setOrderBy(null);
		} else {
			setOrderBy(property);
		}
	};

	const navigate = useNavigate();

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setPageSize(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0
			? Math.max(0, (1 + page) * pageSize - paginatedEntries.total)
			: 0;

	return (
		<Box sx={{ width: '100%' }}>
			<Paper sx={{ width: '100%', mb: 2 }}>
				<EnhancedTableToolbar />
				<TableContainer>
					<Table
						sx={{ minWidth: 750 }}
						aria-labelledby="tableTitle"
						size="medium"
					>
						<EnhancedTableHead
							numSelected={selected.length}
							order={order}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
						/>
						<TableBody>
							{paginatedEntries.entries.map((entry, index) => {
								const labelId = `enhanced-table-checkbox-${index}`;
								return (
									<TableRow
										hover
										role="checkbox"
										tabIndex={-1}
										key={entry.id}
									>
										<TableCell
											component="th"
											id={labelId}
											scope="row"
										>
											<Link
												component="button"
												variant="body2"
												onClick={() => {
													navigate(`${entry.id}`);
												}}
											>
												{entry.key}
											</Link>
										</TableCell>
										<TableCell
											align="right"
											sx={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												width: '200px',
											}}
										>
											{entry.spelling}
										</TableCell>
										<TableCell
											align="right"
											sx={{
												textOverflow: 'ellipsis',
												width: '200px',
											}}
										>
											{entry.comment}
										</TableCell>
										<TableCell
											align="right"
											sx={{
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												width: '200px',
												maxWidth: '200px',
											}}
										>
											{entry.translations.join(', ')}
										</TableCell>
									</TableRow>
								);
							})}
							{emptyRows > 0 && (
								<TableRow
									style={{
										height: 53 * emptyRows,
									}}
								>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={paginatedEntries.total}
					rowsPerPage={pageSize}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Paper>
		</Box>
	);
};

export default DictionaryTable;
