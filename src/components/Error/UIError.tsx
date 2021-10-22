import './UIError.css';
import React from 'react';
import { Alert } from 'antd';

export interface IUIError {
	message: string;
	id: string;
	type: 'success' | 'info' | 'warning' | 'error';
}

const UIError: React.FC<IUIError> = ({ message, id, type }) => {
	return <Alert type={type} message={message} key={id} />;
};

export default UIError;
