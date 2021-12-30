import * as React from 'react';
import {
	Box,
	Checkbox,
	Chip,
	IconButton,
	Link,
	Menu,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useListDictionaryEntries } from '@hooks/DictionaryQueryHooks';
import { useAllTags } from '@hooks/useTags';
import { IListDictionaryParams } from 'api/definitions/api';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { visuallyHidden } from '@mui/utils';
import { useNavigate } from 'react-router';
import useDebounce from '@hooks/useDebounce';
import { DictionaryTagID, notUndefined } from 'Document/Utility';
import { FilterList } from '@mui/icons-material';

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
		id: 'tags',
		disablePadding: false,
		label: 'Tags',
	},
	{
		id: 'translations',
		disablePadding: false,
		label: 'Translations',
	},
];

interface FilterableTableHeadCellProps<T extends { id: unknown }> {
	headCell: HeadCell;
	onRequestFilterTag: (key: string, checked: boolean) => void;
	tagFilter: Array<T['id']>;
	allFilterOptions: Array<T>;
}

const ITEM_HEIGHT = 48;
const FilterableTableHeadCell: React.FC<
	FilterableTableHeadCellProps<IDictionaryTag>
> = ({ headCell, onRequestFilterTag, tagFilter, allFilterOptions }) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleCheckFilter = (
		event: React.ChangeEvent<HTMLInputElement>,
		checked: boolean
	) => {
		onRequestFilterTag(event.target.name, checked);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<Stack spacing={1} direction="row" alignItems="center">
			{headCell.label}
			<IconButton
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
				color={tagFilter.length > 0 ? 'secondary' : 'primary'}
			>
				<FilterList />
			</IconButton>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
				PaperProps={{
					style: {
						maxHeight: ITEM_HEIGHT * 4.5,
						width: '20ch',
					},
				}}
			>
				{allFilterOptions.map((tag) => (
					<MenuItem
						dense
						sx={{
							height: '20px',
							paddingLeft: '1px',
						}}
					>
						<Stack spacing={1} direction="row" alignItems="center">
							<Checkbox
								checked={
									!!tagFilter.find(
										(filter) => filter === tag.id
									)
								}
								name={tag.id}
								onChange={handleCheckFilter}
							/>
							<Chip
								sx={{
									backgroundColor: tag.color || 'blue',
									marginLeft: '5px',
									width: '100%',
								}}
								key={tag.name}
								label={tag.name}
							/>
						</Stack>
					</MenuItem>
				))}
			</Menu>
		</Stack>
	);
};

interface SortableTableHeadCellProps {
	onRequestSort: (
		event: React.MouseEvent<unknown>,
		property: keyof IDictionaryEntry
	) => void;
	headCell: HeadCell;
	order: Order;
	orderBy: string | null;
}
const SortableTableHeadCell: React.FC<SortableTableHeadCellProps> = ({
	orderBy,
	order,
	headCell,
	onRequestSort,
}) => {
	const createSortHandler =
		(property: keyof IDictionaryEntry) =>
		(event: React.MouseEvent<unknown>) => {
			onRequestSort(event, property);
		};
	return (
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
	);
};

interface EnhancedTableProps {
	onRequestSort: (
		event: React.MouseEvent<unknown>,
		property: keyof IDictionaryEntry
	) => void;
	onRequestFilterTag: (key: string, checked: boolean) => void;
	order: Order;
	orderBy: string | null;
	tagFilter: Array<DictionaryTagID>;
	allTags: Array<IDictionaryTag>;
}
const EnhancedTableHead: React.FC<EnhancedTableProps> = ({
	order,
	orderBy,
	onRequestSort,
	onRequestFilterTag,
	tagFilter,
	allTags,
}) => {
	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						padding={headCell.disablePadding ? 'none' : 'normal'}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						{headCell.id === 'tags' ? (
							<FilterableTableHeadCell
								allFilterOptions={allTags}
								tagFilter={tagFilter}
								headCell={headCell}
								onRequestFilterTag={onRequestFilterTag}
							/>
						) : (
							<SortableTableHeadCell
								orderBy={orderBy}
								order={order}
								headCell={headCell}
								onRequestSort={onRequestSort}
							/>
						)}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
};

const DictionaryTable: React.FC = () => {
	const [order, setOrder] = useState<Order>('asc');
	const [orderBy, setOrderBy] = useState<keyof IDictionaryEntry | null>(null);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	// const [filter, setFilter] = useState<keyof IDictionaryEntry | null>(null);
	const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const selectedLanguage = useActiveLanguageConf();
	const allUserTags = useAllTags();
	const [tagFilter, setTagFilter] = useState<Array<DictionaryTagID>>([]);

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
			searchTerm: debouncedSearchTerm,
			tagFilter,
		}),
		[
			order,
			orderBy,
			page,
			pageSize,
			debouncedSearchTerm,
			selectedLanguage?.id,
			tagFilter,
		]
	);
	const [loading, paginatedEntries] =
		useListDictionaryEntries(paginationOptions);

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
					<TextField
						label="Search"
						value={searchTerm}
						onChange={(e) =>
							setSearchTerm(e.target.value || undefined)
						}
					/>
				</Toolbar>
				<TableContainer>
					<Table
						sx={{ minWidth: 750 }}
						aria-labelledby="tableTitle"
						size="medium"
					>
						<EnhancedTableHead
							order={order}
							allTags={allUserTags}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
							onRequestFilterTag={(key, checked) => {
								if (checked) {
									setTagFilter([
										...tagFilter,
										key as DictionaryTagID,
									]);
								} else {
									setTagFilter(
										tagFilter.filter(
											(tagId) =>
												tagId !==
												(key as DictionaryTagID)
										)
									);
								}
							}}
							tagFilter={tagFilter}
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
											{entry.tags
												.map((tagId) =>
													allUserTags.find(
														(userTag) =>
															userTag.id === tagId
													)
												)
												.filter(notUndefined)
												.map((tag) => (
													<Chip
														style={{
															backgroundColor:
																tag.color ||
																'blue',
															marginLeft: '5px',
														}}
														key={tag.name}
														label={tag.name}
													/>
												))}
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
