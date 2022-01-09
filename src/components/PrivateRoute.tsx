import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserContext } from '@hooks/useUserContext';
import { Role } from 'api/user.service';

interface IPrivateRouteProps {
	roles: Role[];
}

const PrivateRoute: React.FC<IPrivateRouteProps> = ({ children, roles }) => {
	const user = useUserContext();
	const location = useLocation();

	if (user && roles.includes(user.role)) {
		// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33006
		return <>{children}</>;
	}
	return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
