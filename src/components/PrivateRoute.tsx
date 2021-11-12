import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useUserContext } from '@hooks/useUserContext';
import { Role } from 'api/user.service';

interface IPrivateRouteProps {
	component: React.FC;
	path: string;
	exact: boolean;
	roles: Role[];
}

const PrivateRoute: React.FC<IPrivateRouteProps> = ({
	path,
	exact,
	component,
	roles,
}: IPrivateRouteProps) => {
	const user = useUserContext();

	return user && roles.includes(user.role) ? (
		<Route path={path} exact={exact} component={component} />
	) : (
		<Redirect to="/login" />
	);
};

export default PrivateRoute;
