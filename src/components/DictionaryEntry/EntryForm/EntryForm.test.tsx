import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithDefaultProvider } from '../../../../test/testHelper';
import EntryForm, { IEntryFormOutput } from './EntryForm';

describe('Root Form', () => {
	it('should call submit if form is valid', async () => {
		const mockSubmit = jest.fn(() => {});

		renderWithDefaultProvider(
			<EntryForm
				submitLabel="submitLabel"
				cancelLabel="cancelLabel"
				onSubmit={mockSubmit}
				onCancel={() => {}}
				createTag={() => {}}
				createRoot={() => {}}
			/>
		);

		const keyInputValue = 'testName';
		const nameInput = screen.getByLabelText('Key');
		fireEvent.input(nameInput, {
			target: {
				value: keyInputValue,
			},
		});

		const translationInputValue = ['hello', 'world'];
		const translationInput = screen.getByLabelText('Translation(s)');
		fireEvent.input(translationInput, {
			target: {
				value: translationInputValue.join(';'),
			},
		});
		fireEvent.blur(translationInput);

		const saveButton = screen.getByRole('button', {
			name: /save/i,
		});
		fireEvent.submit(saveButton);

		const expectedOutput: IEntryFormOutput = {
			key: keyInputValue,
			comment: '',
			spelling: '',
			id: '',
			tags: [],
			roots: [],
			translations: translationInputValue,
		};
		await waitFor(() => expect(mockSubmit).toBeCalledWith(expectedOutput));
	});

	it('should display error, when submitted without translation(s)', async () => {
		const mockSubmit = jest.fn(() => {});

		renderWithDefaultProvider(
			<EntryForm
				submitLabel="submitLabel"
				cancelLabel="cancelLabel"
				onSubmit={mockSubmit}
				onCancel={() => {}}
				createTag={() => {}}
				createRoot={() => {}}
			/>
		);

		const saveButton = screen.getByRole('button', {
			name: /save/i,
		});
		fireEvent.click(saveButton);

		expect(
			await screen.findByText(/Please enter at least one translation/i)
		).toBeInTheDocument();

		// Test accessability
		const translationInput = screen.getByLabelText('Translation(s)');
		expect(translationInput.getAttribute('aria-invalid')).toBe('true');

		await waitFor(() => expect(mockSubmit).not.toBeCalled());
	});
});
