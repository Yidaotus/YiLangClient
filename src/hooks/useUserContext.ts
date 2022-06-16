import { UserContext } from '@components/AuthProvider/AuthProvider';
import { useContext } from 'react';

const useUserContext = () => {
	return useContext(UserContext).user;
};

const useActiveDocument = () => {
	const { activeDocument, changeActiveDocument } = useContext(UserContext);
	return [activeDocument, changeActiveDocument] as const;
};

const useCurrentFontSize = () => {
	const { fontSize, changeFontSize } = useContext(UserContext);
	return [fontSize, changeFontSize] as const;
};

export { useUserContext, useActiveDocument, useCurrentFontSize };
