import { render, screen } from '@testing-library/react';
import TagForm, { ITagFormOutput } from './TagForm';

describe('Tag Form', () => {
	it('should render cancel element correctly', async () => {
		const cancelLabel = 'cancelLabelTest';
		render(
			<TagForm
				submitLabel="submitTag"
				cancelLabel={cancelLabel}
				onSubmit={(newTag: ITagFormOutput) => {}}
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
				onSubmit={(newTag: ITagFormOutput) => {}}
				onCancel={() => {}}
			/>
		);

		const saveButton = screen.getByRole('button', {
			name: /save/i,
		});
		expect(saveButton.textContent).toBe(submitLabel);
	});
});
