import { fetchConfig } from 'api/user.service';
import { IConfig } from 'Document/Config';
import { useQuery } from 'react-query';

const useUserConfig = (): IConfig | null => {
	const { data } = useQuery(['userConfig'], fetchConfig, {
		refetchOnWindowFocus: false,
	});

	return data || null;
};

export default useUserConfig;
