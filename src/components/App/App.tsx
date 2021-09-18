import React, { useState, FC, useEffect } from 'react';
import './App.css';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom';
import PrivateRoute from '@components/PrivateRoute';
import { Role } from '@store/user/types';
import { authorize as authDispatcher } from '@store/user/actions';
import { useDispatch, useSelector } from 'react-redux';
import { IRootDispatch } from '@store/index';
import Home from '@views/Home/Home';
import Login from '@views/Login';
import Verify from '@views/Verify';
import { notification, Spin } from 'antd';
import handleError from '@helpers/Error';
import { selectActiveUser } from '@store/user/selectors';

const App: FC = () => {
	const dispatch: IRootDispatch = useDispatch();
	const [loading, setLoading] = useState(true);
	const user = useSelector(selectActiveUser);

	notification.config({
		placement: 'topRight',
		top: 80,
		duration: 3,
	});

	useEffect(() => {
		setLoading(true);
		const auth = async () => {
			try {
				await dispatch(authDispatcher());
			} catch (e) {
				handleError(e);
			} finally {
				setLoading(false);
			}
		};
		auth();
	}, [dispatch]);

	return (
		<>
			{loading ? (
				<Spin tip="Loading Application" />
			) : (
				<Router>
					<Switch>
						<Route path="/login">
							{user ? <Redirect to="/home" /> : <Login />}
						</Route>
						<Route path="/verify/:code">
							<Verify />
						</Route>
						<PrivateRoute
							path="/home"
							component={Home}
							exact={false}
							roles={[Role.ADMIN, Role.USER]}
						/>
						<Route path="/">
							<Redirect to="/home" />
						</Route>
					</Switch>
				</Router>
			)}
		</>
	);
};

export default App;
