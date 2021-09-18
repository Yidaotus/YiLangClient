import { IDocument } from 'Document/Document';

import {
	ApiPaths,
	IApiResponse,
	IListDocumentResult,
	IListDocumentsParams,
} from './definitions/api';
import ApiService from './api.service';

const DocumentEndpoints = ApiPaths.document.endpoints;
const DocumentPath = (endpoint: string) =>
	`${ApiPaths.document.path}/${endpoint}`;

const remove = async (id: string): Promise<void> => {
	const { path } = DocumentEndpoints.remove;
	await ApiService.delete<IApiResponse<void>>(`${DocumentPath(path)}/${id}`);
};

const save = async (document: IDocument): Promise<void> => {
	const { path } = DocumentEndpoints.save;
	await ApiService.post<IApiResponse<void>>(DocumentPath(path), document);
};

const getDocument = async (id: string): Promise<IDocument> => {
	const { path } = DocumentEndpoints.getById;
	const response = await ApiService.get<IApiResponse<IDocument>>(
		`${DocumentPath(path)}/${id}`
	);
	return response.data.payload as IDocument;
};

const listDocuments = async (
	listParams: IListDocumentsParams
): Promise<IListDocumentResult> => {
	const { path } = DocumentEndpoints.list;
	const response = await ApiService.post<IApiResponse<IListDocumentResult>>(
		DocumentPath(path),
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
