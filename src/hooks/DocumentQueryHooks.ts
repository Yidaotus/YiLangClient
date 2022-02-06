import useUiErrorHandler from '@helpers/useUiErrorHandler';
import { queryKeyFactory } from '@helpers/queryHelper';
import {
	IApiResponse,
	IListDocumentResult,
	IListDocumentsParams,
} from 'api/definitions/api';
import {
	remove,
	getDocument,
	listDocuments,
	update,
	create,
	fetchDocumentItems,
} from 'api/document.service';
import { IDocumentSerialized } from 'Document/Document';
import {
	useQueryClient,
	useMutation,
	useQuery,
	UseMutationResult,
} from 'react-query';
import { useActiveLanguageConf } from './ConfigQueryHooks';
import { useEffect, useState } from 'react';

const documentKeys = queryKeyFactory('documents');
//TODO Extract magic string
const entryKeys = queryKeyFactory('entries');
const sentenceKeys = queryKeyFactory('sentences');

const usePrefetchDocumentItems = (id: string | undefined) => {
	const [fetching, setFetching] = useState(false);
	const queryClient = useQueryClient();
	const language = useActiveLanguageConf();
	const handleError = useUiErrorHandler();

	useEffect(() => {
		if (!id || !language) {
			return;
		}
		const fetch = async () => {
			setFetching(true);
			try {
				const items = await fetchDocumentItems({
					id,
					language: language.id,
				});

				for (const wordItem of items.wordItems) {
					queryClient.setQueryData(
						entryKeys(language.id).detail(wordItem.id),
						wordItem
					);
				}
				for (const sentenceItem of items.sentenceItems) {
					queryClient.setQueryData(
						sentenceKeys(language.id).detail(sentenceItem.id),
						sentenceItem
					);
				}
			} catch (e) {
				handleError(e);
			} finally {
				setFetching(false);
			}
		};
		fetch();
	}, [handleError, id, language, queryClient]);

	return fetching;
};

const useEditorDocument = (
	id: string | undefined
): [boolean, IDocumentSerialized | null] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		documentKeys(activeLanguage?.id).detail(id),
		() => {
			if (!id || !activeLanguage) {
				throw new Error('No language selected!');
			}
			return getDocument({
				id,
				language: activeLanguage.id,
			});
		},
		{
			enabled: !!id && !!activeLanguage,
			keepPreviousData: true,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data || null];
};

const defaultValue = {
	total: 0,
	excerpts: [],
};

const useListDocuments = (
	paginationOptions: Omit<IListDocumentsParams, 'lang'> | null
): [boolean, IListDocumentResult] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		documentKeys(activeLanguage?.id).list({
			limit: paginationOptions?.limit,
			skip: paginationOptions?.skip,
			sortBy: paginationOptions?.sortBy,
		}),
		() => {
			if (!activeLanguage || !paginationOptions) {
				throw new Error('No Language/Pagination selected!');
			}
			return listDocuments({
				sortBy: paginationOptions.sortBy,
				skip: paginationOptions.skip,
				limit: paginationOptions.limit,
				excerptLength: 80,
				lang: activeLanguage.id,
			});
		},
		{
			enabled: !!paginationOptions && !!activeLanguage,
			keepPreviousData: true,
			staleTime: 60000,
		}
	);

	return [isLoading, data || defaultValue];
};

const useUpdateEditorDocument = (): UseMutationResult<
	void,
	IApiResponse<void>,
	{
		id: string;
		title: string;
		serializedDocument: string;
	},
	unknown
> => {
	const activeLanguage = useActiveLanguageConf();
	const handleError = useUiErrorHandler();
	const queryClient = useQueryClient();

	return useMutation(
		({
			id,
			title,
			serializedDocument,
		}: {
			id: string;
			title: string;
			serializedDocument: string;
		}) => {
			if (!activeLanguage) {
				throw new Error('No language selected!');
			}
			return update({
				id,
				language: activeLanguage.id,
				document: { title, serializedDocument },
			});
		},
		{
			onSuccess: (_, { id }) => {
				queryClient.invalidateQueries(
					documentKeys(activeLanguage?.id).lists()
				);
				queryClient.invalidateQueries(
					documentKeys(activeLanguage?.id).detail(id)
				);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useCreateDocument = (): UseMutationResult<
	string,
	IApiResponse<void>,
	void,
	unknown
> => {
	const activeLanguage = useActiveLanguageConf();
	const queryClient = useQueryClient();
	const handleError = useUiErrorHandler();

	return useMutation(
		() => {
			if (!activeLanguage) {
				throw new Error('No Language selected!');
			}
			return create(activeLanguage.id);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(
					documentKeys(activeLanguage?.id).lists()
				);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useDeleteEditorDocument = (): UseMutationResult<
	void,
	IApiResponse<void>,
	string,
	unknown
> => {
	const activeLanguage = useActiveLanguageConf();
	const queryClient = useQueryClient();
	const handleError = useUiErrorHandler();

	return useMutation(
		(id: string) => {
			if (!activeLanguage) {
				throw new Error('No Language selected!');
			}
			return remove({ id, language: activeLanguage.id });
		},
		{
			onSuccess: (_, id) => {
				queryClient.invalidateQueries(
					documentKeys(activeLanguage?.id).lists()
				);
				queryClient.invalidateQueries(
					documentKeys(activeLanguage?.id).detail(id)
				);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

export {
	useDeleteEditorDocument,
	usePrefetchDocumentItems,
	useEditorDocument,
	useListDocuments,
	useUpdateEditorDocument,
	useCreateDocument,
};
