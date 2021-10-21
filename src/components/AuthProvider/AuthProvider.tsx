import handleError from '@helpers/Error';
import { Spin } from 'antd';
import { LS_TOKEN_POINTER } from 'api/api.service';
import { authorize } from 'api/user.service';
import { IConfig } from 'Document/Config';
import { useEffect } from 'hoist-non-react-statics/node_modules/@types/react';
import React, { useState } from 'react';
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

export const UserContext = React.createContext<IUser | null>(null);

const UserProvider: React.FC = ({ children }) => {
	const user = useQuery(['user'], authorize, {
		retry: false,
		cacheTime: Infinity,
		refetchOnWindowFocus: false,
	});

	return (
		<>
			{user.isLoading ? (
				<Spin tip="Checking user credentials" />
			) : (
				<UserContext.Provider
					value={user.data ? { ...user.data, role: Role.USER } : null}
				>
					{children}
				</UserContext.Provider>
			)}
		</>
	);
};

export default UserProvider;
