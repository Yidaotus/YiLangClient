import { rest } from 'msw';
import API_URL from '../src/api/config';
import {
	testDicitonarySearchResponse,
	testLanguageConfig,
	testTagSearchResponse,
} from '../test/testData';

const routes = [
	rest.get(API_URL + '/config', (req, res, ctx) => {
		const apiResponse = {
			status: 1,
			message: 'Got entries',
			payload: testLanguageConfig,
		};
		return res(ctx.json(apiResponse));
	}),
	rest.post(API_URL + '/dictionary/:langId/tags/search', (req, res, ctx) => {
		const apiResponse = {
			status: 1,
			message: 'Got entries',
			payload: testTagSearchResponse,
		};
		return res(ctx.json(apiResponse));
	}),
	rest.post(
		API_URL + '/dictionary/:langId/entries/search',
		(req, res, ctx) => {
			const apiResponse = {
				status: 1,
				message: 'Got entries',
				payload: testDicitonarySearchResponse,
			};
			return res(ctx.json(apiResponse));
		}
	),
];

export default routes;
