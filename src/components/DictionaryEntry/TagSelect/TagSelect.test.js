/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TagSelect from './TagSelect';
import { QueryClientProvider, QueryClient } from 'react-query';

const server = setupServer(
	rest.post('/api/dictionary/:langId/tags/search', (req, res, ctx) => {
		const response = [
			{
				id: 'testId1',
				name: 'testTagResult1',
				lang: 'testLang1',
				color: 'testColor1',
			},
			{
				id: 'testId2',
				name: 'testTagResult2',
				lang: 'testLang2',
				color: 'testColor2',
			},
		];
		return res(ctx.json({ greeting: 'hello there' }));
	})
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createWrapper = (children) => {};

test('display search results', async () => {
	/*
export interface ITagSelectProps {
	value: IDictionaryEntryInput['tags'];
	placeholder: string;
	create: (input: string) => void;
	onChange: (tags: IDictionaryEntryInput['tags']) => void;
}
	id: string;
	name: string;
	lang: string;
	color?: string;
	grammarPoint?: IGrammarPoint;

*/
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});
	const initialValue = [
		{
			id: 'testId',
			name: 'testName',
			lang: 'jp',
			color: 'red',
			grammarPoint: {},
		},
	];
	render(
		<QueryClientProvider client={queryClient}>
			<TagSelect
				value={initialValue}
				placeholder="tags"
				create={(input) => {}}
				onChange={(newValue) => {}}
			/>
		</QueryClientProvider>
	);

	fireEvent.change(screen.getByLabelText('tags'), {
		target: { value: 'testEntry' },
	});

	expect(await screen.findByText('testTagResult1')).toBeInTheDocument();
	expect(await screen.findByText('testTagResult2')).toBeInTheDocument();
});

/*
test('handles server error', async () => {
	server.use(
		rest.get('/greeting', (req, res, ctx) => {
			return res(ctx.status(500));
		})
	);

	render(<Fetch url="/greeting" />);

	fireEvent.click(screen.getByText('Load Greeting'));

	await waitFor(() => screen.getByRole('alert'));

	expect(screen.getByRole('alert')).toHaveTextContent(
		'Oops, failed to fetch!'
	);
	expect(screen.getByRole('button')).not.toBeDisabled();
});
*/
