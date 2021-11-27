import { IUser, UserContext } from '@components/AuthProvider/AuthProvider';
import { useContext } from 'react';

const useUserContext = (): IUser | null => {
	return useContext(UserContext).user;
};

const useActiveDocument = (): [string | null, (id: string) => void] => {
	const { activeDocument, changeActiveDocument } = useContext(UserContext);
	return [activeDocument, changeActiveDocument];
};

export { useUserContext, useActiveDocument };
