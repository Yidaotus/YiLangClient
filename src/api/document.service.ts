import { IDocument } from 'Document/Document';

import {
	IApiResponse,
	IListDocumentResult,
	IListDocumentsParams,
} from './definitions/api';
import ApiService from './api.service';

const remove = async (id: string): Promise<void> => {
	await ApiService.delete<IApiResponse<void>>(`documents/${id}`);
};

const save = async (document: IDocument): Promise<void> => {
	await ApiService.post<IApiResponse<void>>('documents', document);
};

const getDocument = async (id: string): Promise<IDocument> => {
	const response = await ApiService.get<IApiResponse<IDocument>>(
		`documents/${id}`
	);
	return response.data.payload as IDocument;
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

export { save, getDocument, listDocuments, remove };
