import React from 'react';
import {
	fireEvent,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import TagSelect from './TagSelect';
import { testTagSearchResponse } from '../../../../test/testData';
import { renderWithDefaultProvider } from '../../../../test/testHelper';

describe('Tag Select', () => {
	it('Render provided value correctly', async () => {
		const initialValue = [
			{
				id: 'testId',
				name: 'testName',
				lang: 'jp',
				color: 'red',
			},
			{
				id: 'testId2',
				name: 'testName2',
				lang: 'jp',
				color: 'red',
			},
			{
				id: 'testId3',
				name: 'testName3',
				lang: 'jp',
				color: 'red',
			},
		];
		const mockOnChange = jest.fn();

		renderWithDefaultProvider(
			<TagSelect
				value={initialValue}
				placeholder="tags"
				create={() => {}}
				onChange={mockOnChange}
			/>
		);

		for (const testValue of initialValue) {
			expect(await screen.findByText(testValue.name)).toBeInTheDocument();
		}
	});

	it(`Don't show create option on input with the same name as found option`, async () => {
		const initialTagName = 'testEntryName';
		const initialValue = [
			{
				id: 'testId',
				name: initialTagName,
				lang: 'jp',
				color: 'red',
			},
		];
		const mockOnCreate = jest.fn();

		renderWithDefaultProvider(
			<TagSelect
				value={initialValue}
				placeholder="tags"
				create={mockOnCreate}
				onChange={() => {}}
			/>
		);

		const inputElement = screen.getByLabelText('tags');

		fireEvent.change(inputElement, {
			target: { value: initialTagName },
		});

		await waitForElementToBeRemoved(screen.getByText(/loading/i));
		const targetTagElement = screen.queryByText(
			new RegExp(`create ${initialTagName}`, 'i')
		);

		expect(targetTagElement).toBeNull();
	});

	it('Show and dispatch create option', async () => {
		const initialValue = [
			{
				id: 'testId',
				name: 'testName',
				lang: 'jp',
				color: 'red',
			},
		];
		const mockOnCreate = jest.fn();

		renderWithDefaultProvider(
			<TagSelect
				value={initialValue}
				placeholder="tags"
				create={mockOnCreate}
				onChange={() => {}}
			/>
		);

		const inputElement = screen.getByLabelText('tags');

		const newEntryName = 'New Entry';
		fireEvent.change(inputElement, {
			target: { value: newEntryName },
		});

		await waitForElementToBeRemoved(screen.getByText(/loading/i));
		const targetTagElement = await screen.findByText(
			new RegExp(`create ${newEntryName}`, 'i')
		);
		fireEvent.click(targetTagElement);

		expect(mockOnCreate).toBeCalledWith(newEntryName);
	});

	it('Call provided change callback with the correct item after click', async () => {
		const initialValue = [
			{
				id: 'testId',
				name: 'testName',
				lang: 'jp',
				color: 'red',
			},
		];
		const mockOnChange = jest.fn();

		renderWithDefaultProvider(
			<TagSelect
				value={initialValue}
				placeholder="tags"
				create={() => {}}
				onChange={mockOnChange}
			/>
		);

		const inputElement = screen.getByLabelText('tags');
		expect(inputElement).not.toBeNull();

		fireEvent.change(inputElement, {
			target: { value: 'testEntry' },
		});

		const targetTag = testTagSearchResponse[1];
		const targetTagElement = await screen.findByText(targetTag.name);
		fireEvent.click(targetTagElement);

		expect(mockOnChange).toBeCalledWith(
			expect.arrayContaining([
				expect.objectContaining(initialValue[0]),
				expect.objectContaining(targetTag),
			])
		);
	});

	it('Fetch and display all search results', async () => {
		const initialValue = [
			{
				id: 'testId',
				name: 'testName',
				lang: 'jp',
				color: 'red',
			},
		];
		renderWithDefaultProvider(
			<TagSelect
				value={initialValue}
				placeholder="tags"
				create={() => {}}
				onChange={() => {}}
			/>
		);

		const inputElement = screen.getByLabelText('tags');
		fireEvent.change(inputElement, {
			target: { value: 'testEntry' },
		});

		await waitForElementToBeRemoved(screen.getByText(/loading/i));
		const providedOptions = await screen.findAllByRole('option');
		expect(providedOptions).not.toBeNull();
		for (const expectedTags of [
			...testTagSearchResponse,
			...initialValue,
		]) {
			expect(
				providedOptions?.find((foundOption) =>
					foundOption.textContent?.includes(expectedTags.name)
				)
			).not.toBeUndefined();
		}
	});
});
