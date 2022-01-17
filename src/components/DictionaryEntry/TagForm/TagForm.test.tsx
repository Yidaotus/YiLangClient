import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DEFAULT_TAG_COLOR } from '../YiColorPickerField/YiColorPickerField';
import TagForm, { ITagFormOutput } from './TagForm';

describe('Tag Form', () => {
	it('should call submit if form is valid', async () => {
		const mockSubmit = jest.fn(() => {});

		render(
			<TagForm
				submitLabel="submitLabel"
				cancelLabel="cancelLabel"
				onSubmit={mockSubmit}
				onCancel={() => {}}
			/>
		);

		const nameInputValue = 'testName';
		const nameInput = screen.getByLabelText('name');
		fireEvent.input(nameInput, {
			target: {
				value: nameInputValue,
			},
		});

		const saveButton = screen.getByRole('button', {
			name: /save/i,
		});
		fireEvent.submit(saveButton);

		const expectedOutput: ITagFormOutput = {
			name: nameInputValue,
			id: undefined,
			grammarPoint: undefined,
			color: `hsl(${DEFAULT_TAG_COLOR.colorValue}, ${DEFAULT_TAG_COLOR.saturation}%, ${DEFAULT_TAG_COLOR.lightness}%)`,
		};
		await waitFor(() => expect(mockSubmit).toBeCalledWith(expectedOutput));
	});

	it('should display error, when submitted without a name', async () => {
		const mockSubmit = jest.fn(() => {});

		render(
			<TagForm
				submitLabel="submitLabel"
				cancelLabel="cancelLabel"
				onSubmit={mockSubmit}
				onCancel={() => {}}
			/>
		);

		const saveButton = screen.getByRole('button', {
			name: /save/i,
		});
		fireEvent.click(saveButton);

		expect(
			await screen.findByText(/A valid name is required!/i)
		).toBeInTheDocument();

		// Test accessability
		const nameInput = screen.getByPlaceholderText('name');
		expect(nameInput.getAttribute('aria-invalid')).toBe('true');

		await waitFor(() => expect(mockSubmit).not.toBeCalled());
	});

	it('should render cancel element correctly', async () => {
		const cancelLabel = 'cancelLabelTest';
		render(
			<TagForm
				submitLabel="submitTag"
				cancelLabel={cancelLabel}
				onSubmit={() => {}}
				onCancel={() => {}}
			/>
		);

		const saveButton = screen.getByRole('button', {
			name: /cancel/i,
		});
		expect(saveButton.textContent).toBe(cancelLabel);
	});

	it('should render submit element correctly', async () => {
		const submitLabel = 'submitLabelTest';
		render(
			<TagForm
				submitLabel={submitLabel}
				cancelLabel="cancelTag"
				onSubmit={() => {}}
				onCancel={() => {}}
			/>
		);

		const saveButton = screen.getByRole('button', {
			name: /save/i,
		});
		expect(saveButton.textContent).toBe(submitLabel);
	});
});
