import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagForm, { IDictionaryTagInput } from './TagForm';
import { useForm } from 'react-hook-form';

const FormWrapper: React.FC = () => {
	const form = useForm<IDictionaryTagInput>();
	return <TagForm form={form} />;
};

describe('Tag Form', () => {
	it('should display required error when value is invalid', async () => {
		render(<FormWrapper />);

		expect(await screen.findAllByRole('alert')).toHaveLength(1);
		expect(correct).not.toBe(true);
	});
});
