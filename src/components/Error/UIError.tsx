import './UIError.css';
import { IUIError } from 'store/ui/types';
import React from 'react';
import { Alert } from 'antd';

const UIError: React.FC<IUIError> = ({ message, id, type }) => {
	return <Alert type={type} message={message} key={id} />;
};

export default UIError;
