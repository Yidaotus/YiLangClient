import React from 'react';
import './App.css';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom';
import PrivateRoute from '@components/PrivateRoute';
import Home from '@views/Home/Home';
import Login from '@views/Login';
import Verify from '@views/Verify';
import { notification } from 'antd';
import AuthProvider, { Role } from '@components/AuthProvider/AuthProvider';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const App: React.FC = () => {
	notification.config({
		placement: 'topRight',
		top: 80,
		duration: 3,
	});

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Router>
					<Switch>
						<Route path="/login">
							<Login />
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
			</AuthProvider>
		</QueryClientProvider>
	);
};

export default App;
