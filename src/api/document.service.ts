import { IDocumentSerialized } from 'Document/Document';
import {
	IApiResponse,
	IListDocumentResult,
	IListDocumentsParams,
} from './definitions/api';
import ApiService from './api.service';

const remove = async ({
	id,
	language,
}: {
	id: string;
	language: string;
}): Promise<void> => {
	await ApiService.delete<IApiResponse<void>>(`documents/${language}/${id}`);
};

const create = async (langId: string): Promise<string> => {
	const res = await ApiService.post<IApiResponse<string>>(
		`documents/${langId}`
	);
	return res.data.payload as string;
};

const update = async ({
	id,
	language,
	document,
}: {
	id: string;
	// TODO serialized doc should not be partial use other helper
	language: string;
	document: Partial<
		Omit<
			IDocumentSerialized,
			'id' | 'createdAt' | 'updatedAt' | 'serializedDocument'
		>
	> &
		Pick<IDocumentSerialized, 'serializedDocument'>;
}): Promise<void> => {
	await ApiService.post<IApiResponse<void>>(
		`documents/${language}/${id}`,
		document
	);
};

const getDocument = async ({
	id,
	language,
}: {
	id: string;
	language: string;
}): Promise<IDocumentSerialized> => {
	const response = await ApiService.get<IApiResponse<IDocumentSerialized>>(
		`documents/${language}/${id}`
	);
	return response.data.payload as IDocumentSerialized;
};

const listDocuments = async (
	listParams: IListDocumentsParams
): Promise<IListDocumentResult> => {
	const response = await ApiService.post<IApiResponse<IListDocumentResult>>(
		`documents/${listParams.lang}/list`,
		listParams
	);
	const documentResult = response.data.payload;
	const deserDocuments = documentResult?.excerpts.map((entry) => ({
		...entry,
		createdAt: new Date(entry.createdAt),
		updatedAt: new Date(entry.updatedAt),
	}));
	return {
		total: documentResult?.total,
		excerpts: deserDocuments,
	} as IListDocumentResult;
};

export { create, update, getDocument, listDocuments, remove };
