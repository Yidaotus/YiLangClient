import React from 'react';

import { FRAGMENTTYPEID } from 'Document/Fragment';

interface IFragmentProps {
	id: string;
	className?: string;
	style?: React.CSSProperties;
}

const FragmentElement: React.FC<IFragmentProps> = ({
	id,
	children,
	className,
	style,
	...other
}): JSX.Element => {
	return (
		<span
			data-id={id}
			data-type={FRAGMENTTYPEID}
			className={className}
			style={style}
			{...other}
		>
			{children}
		</span>
	);
};

export default FragmentElement;
