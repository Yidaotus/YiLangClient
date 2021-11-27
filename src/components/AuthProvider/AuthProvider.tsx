import { Spinner } from '@blueprintjs/core';
import { authorize } from 'api/user.service';
import { IConfig } from 'Document/Config';
import React, { useCallback, useState } from 'react';
import { useQuery } from 'react-query';

export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
}

export interface IUser {
	username: string;
	email: string;
	role: Role;
}

export interface IEditorSettings {
	showSpellingDefault: boolean;
}

export interface IUserState {
	user: IUser | null;
	jwt: string | null;
	errors: string[];
	config: IConfig;
	editorSettings: IEditorSettings;
}

export interface IUserContext {
	user: IUser | null;
	activeDocument: string | null;
	changeActiveDocument: (docId: string) => void;
}
export const UserContext = React.createContext<IUserContext>({
	user: null,
	activeDocument: null,
	changeActiveDocument: () => {},
});

const UserProvider: React.FC = ({ children }) => {
	const user = useQuery(['user'], authorize, {
		retry: false,
		cacheTime: Infinity,
		refetchOnWindowFocus: false,
	});
	const [activeDocument, setActiveDocument] = useState<string | null>(null);

	const changeActiveDocument = useCallback(
		(docId: string) => {
			setActiveDocument(docId);
		},
		[setActiveDocument]
	);

	return (
		<>
			{user.isLoading ? (
				<div>
					<Spinner />
					<p>Checking user credentials</p>
				</div>
			) : (
				<UserContext.Provider
					value={{
						user: user.data
							? { ...user.data, role: Role.USER }
							: null,
						activeDocument,
						changeActiveDocument,
					}}
				>
					{children}
				</UserContext.Provider>
			)}
		</>
	);
};

export default UserProvider;
