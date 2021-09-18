import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Role } from 'store/user/types';
import { selectActiveUser } from '@store/user/selectors';

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
	const user = useSelector(selectActiveUser);

	return user && roles.includes(user.role) ? (
		<Route path={path} exact={exact} component={component} />
	) : (
		<Redirect to="/login" />
	);
};

export default PrivateRoute;
