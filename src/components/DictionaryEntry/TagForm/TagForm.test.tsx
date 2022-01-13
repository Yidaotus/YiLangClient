import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagForm, { IDictionaryTagInput } from './TagForm';
import { useForm } from 'react-hook-form';

describe('Tag Form', () => {
	it('should display required error when value is invalid', async () => {
		const form = useForm<IDictionaryTagInput>();
		render(<TagForm form={form} />);

		const correct = form.trigger();

		expect(await screen.findAllByRole('alert')).toHaveLength(1);
		expect(correct).not.toBe(true);
	});
});
