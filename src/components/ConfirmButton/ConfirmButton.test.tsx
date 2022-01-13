import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmButton from './ConfirmButton';

describe('Confirm Button', () => {
	it('First click should not trigger callback', () => {
		const mockOnConfirm = jest.fn();
		render(
			<ConfirmButton
				icon={<span>Test Button</span>}
				onConfirm={mockOnConfirm}
			/>
		);

		const buttonElement = screen.getByRole('button');
		fireEvent.click(buttonElement);

		expect(mockOnConfirm).not.toBeCalled();
	});

	it('Second click should trigger callback', () => {
		const mockOnConfirm = jest.fn();
		render(
			<ConfirmButton
				icon={<span>Test Button</span>}
				onConfirm={mockOnConfirm}
			/>
		);

		const buttonElement = screen.getByRole('button');
		fireEvent.click(buttonElement);
		fireEvent.click(buttonElement);
		expect(mockOnConfirm).toBeCalledTimes(1);
	});
});
