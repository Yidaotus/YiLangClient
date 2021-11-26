import handleError from '@helpers/Error';
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
} from 'api/document.service';
import { IDocumentSerialized } from 'Document/Document';
import { useQueryClient, useMutation, useQuery } from 'react-query';
import { useActiveLanguageConf } from './ConfigQueryHooks';

const useEditorDocument = (
	id: string
): [boolean, IDocumentSerialized | null] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		['documents', activeLanguage?.id, id],
		() => {
			if (!activeLanguage) {
				throw new Error('No Language selected!');
			}
			return getDocument({
				id,
				language: activeLanguage.id,
			});
		},
		{
			enabled: !!id,
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
		[
			'documents',
			activeLanguage?.id,
			'list',
			paginationOptions?.limit,
			paginationOptions?.skip,
			paginationOptions?.sortBy,
		],
		() =>
			paginationOptions && activeLanguage
				? listDocuments({
						sortBy: paginationOptions.sortBy,
						skip: paginationOptions.skip,
						limit: paginationOptions.limit,
						excerptLength: 80,
						lang: activeLanguage.id,
				  })
				: defaultValue,
		{
			enabled: !!paginationOptions,
			keepPreviousData: true,
			staleTime: 60000,
		}
	);

	return [isLoading, data || defaultValue];
};

const useUpdateEditorDocument = () => {
	const lang = useActiveLanguageConf();
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
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return update({
				id,
				language: lang.id,
				document: { title, serializedDocument },
			});
		},
		{
			onSuccess: (_, { id }) => {
				queryClient.invalidateQueries(['documents', lang?.id, 'list']);
				queryClient.invalidateQueries(['documents', lang?.id, id]);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useCreateDocument = () => {
	const lang = useActiveLanguageConf();
	const queryClient = useQueryClient();

	return useMutation(
		() => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return create(lang.id);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['documents', lang?.id, 'list']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useDeleteEditorDocument = () => {
	const lang = useActiveLanguageConf();
	const queryClient = useQueryClient();

	return useMutation(
		(id: string) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return remove({ id, language: lang.id });
		},
		{
			onSuccess: (_, id) => {
				queryClient.invalidateQueries(['documents', lang?.id, 'list']);
				queryClient.invalidateQueries(['documents', lang?.id, id]);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

export {
	useDeleteEditorDocument,
	useEditorDocument,
	useListDocuments,
	useUpdateEditorDocument,
	useCreateDocument,
};
