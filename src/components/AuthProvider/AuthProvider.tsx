import ApiService from 'api/api.service';
import { ApiStatuses, IApiResponse } from 'api/definitions/api';
import { authorize } from 'api/user.service';
import { AxiosError } from 'axios';
import { IConfig } from 'Document/Config';
import React, { useCallback, useEffect, useState } from 'react';
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
	changeActiveDocument: (docId: string | null) => void;
	logout: () => void;
}

export const UserContext = React.createContext<IUserContext>({
	user: null,
	activeDocument: null,
	changeActiveDocument: () => {},
	logout: () => {},
});

const UserProvider: React.FC = ({ children }) => {
	const serverUser = useQuery(['user'], authorize, {
		retry: false,
		cacheTime: Infinity,
		refetchOnWindowFocus: false,
	});
	const [user, setUser] = useState<IUser | null>(null);
	const [activeDocument, setActiveDocument] = useState<string | null>(null);

	const changeActiveDocument = useCallback(
		(docId: string | null) => {
			setActiveDocument(docId);
		},
		[setActiveDocument]
	);

	const logout = useCallback(() => {
		setUser(null);
	}, [setUser]);

	useEffect(() => {
		setUser(
			serverUser.data ? { ...serverUser?.data, role: Role.USER } : null
		);
	}, [serverUser.data, setUser]);

	useEffect(() => {
		const interceptorId = ApiService.interceptors.response.use(
			(response) => {
				return response;
			},
			async (error) => {
				if ((error.response || {}).data) {
					const { data } = error.response;
					const { status, message } = data as IApiResponse<void>;
					switch (status) {
						case ApiStatuses.UNAUTHANTICATED:
						case ApiStatuses.UNAUTHORIZED: {
							setUser(null);
							break;
						}
						default:
							break;
					}
					const axiosError = error as AxiosError<IApiResponse<void>>;
					axiosError.message = message;
					return Promise.reject(data);
				}
				if (!error.status) {
					return Promise.reject(new Error('Server unavailiable'));
				}
				// throw new Error('Invalid ApiResponce Object so Fatal!');
				return Promise.reject();
			}
		);

		return () => {
			ApiService.interceptors.response.eject(interceptorId);
		};
	}, [setUser]);

	return (
		<>
			{serverUser.isLoading ? (
				<div>
					<p>Checking user credentials</p>
				</div>
			) : (
				<UserContext.Provider
					value={{
						user,
						activeDocument,
						changeActiveDocument,
						logout,
					}}
				>
					{children}
				</UserContext.Provider>
			)}
		</>
	);
};

export default UserProvider;
