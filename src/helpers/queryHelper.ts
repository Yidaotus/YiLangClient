const queryKeyFactory =
	(rootKey: string) => (languageId: string | undefined) => {
		const factoryKeys = {
			all: [rootKey, languageId] as const,
			lists: () => [...factoryKeys.all, 'list'] as const,
			list: (filters: string | Record<string, unknown> | undefined) =>
				[...factoryKeys.lists(), filters] as const,
			details: () => [...factoryKeys.all, 'detail'] as const,
			detail: (id: string | undefined) =>
				[...factoryKeys.details(), id] as const,
			by: (Noun: string, id: string | undefined) =>
				[factoryKeys.all, `by${Noun}`, id] as const,
		};
		return factoryKeys;
	};

// eslint-disable-next-line import/prefer-default-export
export { queryKeyFactory };
