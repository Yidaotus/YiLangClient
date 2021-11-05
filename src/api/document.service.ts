import { IDocumentSerialized } from 'Document/Document';
import {
	IApiResponse,
	IListDocumentResult,
	IListDocumentsParams,
} from './definitions/api';
import ApiService from './api.service';

const remove = async (id: string): Promise<void> => {
	await ApiService.delete<IApiResponse<void>>(`documents/${id}`);
};

const create = async (
	document: Omit<
		IDocumentSerialized,
		'id' | 'createdAt' | 'updatedAt' | 'title'
	>
): Promise<string> => {
	const res = await ApiService.post<IApiResponse<string>>(
		'documents',
		document
	);
	return res.data.payload as string;
};

const update = async (
	id: string,
	// TODO serialized doc should not be partial use other helper
	document: Partial<
		Omit<
			IDocumentSerialized,
			'id' | 'createdAt' | 'updatedAt' | 'serializedDocument'
		>
	> &
		Pick<IDocumentSerialized, 'serializedDocument'>
): Promise<void> => {
	await ApiService.post<IApiResponse<void>>(`documents/${id}`, document);
};

const getDocument = async (id: string): Promise<IDocumentSerialized> => {
	const response = await ApiService.get<IApiResponse<IDocumentSerialized>>(
		`documents/${id}`
	);
	return response.data.payload as IDocumentSerialized;
};

const listDocuments = async (
	listParams: IListDocumentsParams
): Promise<IListDocumentResult> => {
	const response = await ApiService.post<IApiResponse<IListDocumentResult>>(
		'documents/list',
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
