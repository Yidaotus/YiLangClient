import { QueryClient } from 'react-query';

const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 60000 } },
});

export default queryClient;
