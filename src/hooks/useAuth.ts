import { IUser, UserContext } from '@components/AuthProvider/AuthProvider';
import { useContext } from 'react';

const useAuth = (): IUser | null => {
	return useContext(UserContext);
};

export default useAuth;
