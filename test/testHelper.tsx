import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

const defaultQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

// See https://github.com/tannerlinsley/react-query/blob/ead2e5dd5237f3d004b66316b5f36af718286d2d/src/react/tests/utils.tsx#L6-L17
const renderWithClient = (client: QueryClient, ui: React.ReactElement) => {
	const { rerender, ...result } = render(
		<QueryClientProvider client={client}>{ui}</QueryClientProvider>
	);
	return {
		...result,
		rerender: (rerenderUi: React.ReactElement) =>
			rerender(
				<QueryClientProvider client={client}>
					{rerenderUi}
				</QueryClientProvider>
			),
	};
};
const renderWithDefaultProvider = (ui: React.ReactElement) => {
	return renderWithClient(defaultQueryClient, ui);
};

export { renderWithClient, renderWithDefaultProvider };
