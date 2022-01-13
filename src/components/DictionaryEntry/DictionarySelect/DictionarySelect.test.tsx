import React from 'react';
import {
	fireEvent,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import DictionarySelect from './DictionarySelect';
import { testDicitonarySearchResponse as testDictionarySearchResponse } from '../../../../test/testData';
import { renderWithDefaultProvider } from '../../../../test/testHelper';
import { IDictionaryEntryInForm, IRootsInput } from '../EntryForm/EntryForm';

describe('Tag Select', () => {
	it('Render provided value correctly', async () => {
		const initialValue: Array<IDictionaryEntryInForm | IRootsInput> = [
			{
				id: 'testId',
				key: 'testKey',
				roots: [],
				tags: [],
				translations: ['none'],
				comment: 'none',
				spelling: 'testSpelling',
			},
			{
				id: 'testId2',
				key: 'testKey2',
				roots: [],
				tags: [],
				translations: ['none'],
				comment: 'none',
				spelling: 'testSpelling2',
			},
			{
				key: 'testRootInput',
				translations: [],
				tags: [],
				roots: [],
			},
		];
		const mockOnChange = jest.fn();

		renderWithDefaultProvider(
			<DictionarySelect
				value={initialValue}
				placeholder="dictionarySelect"
				createRoot={() => {}}
				onChange={mockOnChange}
			/>
		);

		for (const testValue of initialValue) {
			expect(await screen.findByText(testValue.key)).toBeInTheDocument();
		}
	});

	it(`Don't show create option on input with the same name as found option`, async () => {
		const initialEntryKey = 'testEntryKey';
		const initialValue: Array<IDictionaryEntryInForm | IRootsInput> = [
			{
				id: 'testId',
				key: initialEntryKey,
				roots: [],
				tags: [],
				translations: ['none'],
				comment: 'none',
				spelling: 'testSpelling',
			},
		];
		const mockOnCreate = jest.fn();

		renderWithDefaultProvider(
			<DictionarySelect
				value={initialValue}
				placeholder="dictionarySelect"
				createRoot={mockOnCreate}
				onChange={() => {}}
			/>
		);

		const inputElement = screen.getByLabelText('dictionarySelect');

		fireEvent.change(inputElement, {
			target: { value: initialEntryKey },
		});

		await waitForElementToBeRemoved(screen.getByText(/loading/i));
		const targetSelectElement = screen.queryByText(
			new RegExp(`create ${initialEntryKey}`, 'i')
		);

		expect(targetSelectElement).toBeNull();
	});

	it('Show and dispatch create option', async () => {
		const initialValue: Array<IDictionaryEntryInForm | IRootsInput> = [
			{
				id: 'testId',
				key: 'testKey',
				roots: [],
				tags: [],
				translations: ['none'],
				comment: 'none',
				spelling: 'testSpelling',
			},
		];
		const mockOnCreate = jest.fn();

		renderWithDefaultProvider(
			<DictionarySelect
				value={initialValue}
				placeholder="dictionarySelect"
				createRoot={mockOnCreate}
				onChange={() => {}}
			/>
		);

		const inputElement = screen.getByLabelText('dictionarySelect');

		const newEntryName = 'New Entry';
		fireEvent.change(inputElement, {
			target: { value: newEntryName },
		});

		await waitForElementToBeRemoved(screen.getByText(/loading/i));
		const targetSelectElement = await screen.findByText(
			new RegExp(`create ${newEntryName}`, 'i')
		);
		fireEvent.click(targetSelectElement);

		expect(mockOnCreate).toBeCalledWith(newEntryName);
	});

	it('Call provided change callback with the correct item after click', async () => {
		const initialValue = [
			{
				id: 'testId',
				key: 'testKey',
				roots: [],
				tags: [],
				translations: ['none'],
				comment: 'none',
				spelling: 'testSpelling',
			},
		];
		const mockOnChange = jest.fn();

		renderWithDefaultProvider(
			<DictionarySelect
				value={initialValue}
				placeholder="dictionarySelect"
				createRoot={() => {}}
				onChange={mockOnChange}
			/>
		);

		const inputElement = screen.getByLabelText('dictionarySelect');
		expect(inputElement).not.toBeNull();

		fireEvent.change(inputElement, {
			target: { value: 'testEntry' },
		});

		const { createdAt, ...targetEntry } = testDictionarySearchResponse[1];
		const targetSelectElement = await screen.findByText(targetEntry.key);
		fireEvent.click(targetSelectElement);

		expect(mockOnChange).toBeCalledWith(
			expect.arrayContaining([
				expect.objectContaining(initialValue[0]),
				expect.objectContaining(targetEntry),
			])
		);
	});

	it('Fetch and display all search results', async () => {
		const initialValue = [
			{
				id: 'testId',
				key: 'testKey',
				roots: [],
				tags: [],
				translations: ['none'],
				comment: 'none',
				spelling: 'testSpelling',
			},
		];
		renderWithDefaultProvider(
			<DictionarySelect
				value={initialValue}
				placeholder="dictionarySelect"
				createRoot={() => {}}
				onChange={() => {}}
			/>
		);

		const inputElement = screen.getByLabelText('dictionarySelect');
		fireEvent.change(inputElement, {
			target: { value: 'testEntry' },
		});

		await waitForElementToBeRemoved(screen.getByText(/loading/i));
		const providedOptions = await screen.findAllByRole('option');
		expect(providedOptions).not.toBeNull();
		for (const expectedEntry of [
			...testDictionarySearchResponse,
			...initialValue,
		]) {
			expect(
				providedOptions?.find((foundOption) =>
					foundOption.textContent?.includes(expectedEntry.key)
				)
			).not.toBeUndefined();
		}
	});
});
