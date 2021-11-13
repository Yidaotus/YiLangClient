import './Toaster.css';
import { Position, Toaster } from '@blueprintjs/core';

/** Singleton toaster instance. Create separate instances for different options. */
const AppToaster = Toaster.create({
	className: 'recipe-toaster',
	position: Position.TOP_RIGHT,
});

export default AppToaster;
