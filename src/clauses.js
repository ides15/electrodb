const { QueryTypes, MethodTypes } = require("./types");

let clauses = {
	index: {
		name: "index",
		// action(entity, state, facets = {}) {
		// 	// todo: maybe all key info is passed on the subsequent query identifiers?
		// 	// todo: look for article/list of all dynamodb query limitations
		// 	// return state;
		// },
		children: ["get", "delete", "update", "query", "put", "scan", "collection", "create", "patch"],

	},
	collection: {
		name: "collection",
		/* istanbul ignore next */
		action(entity, state, collection = "", facets /* istanbul ignore next */ = {}) {
			state.query.keys.pk = entity._expectFacets(facets, state.query.facets.pk);
			entity._expectFacets(facets, Object.keys(facets), `"query" facets`);
			state.query.collection = collection;
			state.query.method = MethodTypes.query;
			state.query.type = QueryTypes.collection;
			return state;
		},
		children: ["params", "go", "page"],
	},
	scan: {
		name: "scan",
		action(entity, state) {
			state.query.method = MethodTypes.scan;
			return state;
		},
		children: ["params", "go", "page"],
	},
	get: {
		name: "get",
		/* istanbul ignore next */
		action(entity, state, facets = {}) {
			state.query.keys.pk = entity._expectFacets(facets, state.query.facets.pk);
			state.query.method = MethodTypes.get;
			state.query.type = QueryTypes.eq;
			if (state.hasSortKey) {
				let queryFacets = entity._buildQueryFacets(
					facets,
					state.query.facets.sk,
				);
				state.query.keys.sk.push({
					type: state.query.type,
					facets: queryFacets,
				});
			}
			return state;
		},
		children: ["params", "go"],
	},
	delete: {
		name: "delete",
		/* istanbul ignore next */
		action(entity, state, facets = {}) {
			state.query.keys.pk = entity._expectFacets(facets, state.query.facets.pk);
			state.query.method = MethodTypes.delete;
			state.query.type = QueryTypes.eq;
			if (state.hasSortKey) {
				let queryFacets = entity._buildQueryFacets(
					facets,
					state.query.facets.sk,
				);
				state.query.keys.sk.push({
					type: state.query.type,
					facets: queryFacets,
				});
			}
			return state;
		},
		children: ["params", "go"],
	},
	put: {
		name: "put",
		/* istanbul ignore next */
		action(entity, state, payload) {
			let record = entity.model.schema.checkCreate({ ...payload });
			state.query.keys.pk = entity._expectFacets(record, state.query.facets.pk);
			state.query.method = MethodTypes.put;
			state.query.type = QueryTypes.eq;
			if (state.hasSortKey) {
				let queryFacets = entity._buildQueryFacets(
					record,
					state.query.facets.sk,
				);
				state.query.keys.sk.push({
					type: state.query.type,
					facets: queryFacets,
				});
			}

			state.query.put.data = Object.assign({}, record);
			return state;
		},
		children: ["params", "go"],
	},
	create: {
		name: "create",
		action(entity, state, payload) {
			let record = entity.model.schema.checkCreate({ ...payload });
			state.query.keys.pk = entity._expectFacets(record, state.query.facets.pk);
			state.query.method = MethodTypes.put;
			state.query.type = QueryTypes.eq;
			if (state.hasSortKey) {
				let queryFacets = entity._buildQueryFacets(
					record,
					state.query.facets.sk,
				);
				state.query.keys.sk.push({
					type: state.query.type,
					facets: queryFacets,
				});
			}
			state.query.put.data = Object.assign({}, record);
			return state;
		},
		children: ["params", "go"],
	},
	patch: {
		name: "patch",
		action(entity, state, facets) {
			state.query.keys.pk = entity._expectFacets(facets, state.query.facets.pk);
			state.query.method = MethodTypes.update;
			state.query.type = QueryTypes.eq;
			if (state.hasSortKey) {
				let queryFacets = entity._buildQueryFacets(
					facets,
					state.query.facets.sk,
				);
				state.query.keys.sk.push({
					type: state.query.type,
					facets: queryFacets,
				});
			}
			return state;
		},
		children: ["set", "append", "remove", "add", "subtract", ],
	},
	update: {
		name: "update",
		action(entity, state, facets) {
			state.query.keys.pk = entity._expectFacets(facets, state.query.facets.pk);
			state.query.method = MethodTypes.update;
			state.query.type = QueryTypes.eq;
			if (state.hasSortKey) {
				let queryFacets = entity._buildQueryFacets(
					facets,
					state.query.facets.sk,
				);
				state.query.keys.sk.push({
					type: state.query.type,
					facets: queryFacets,
				});
			}
			return state;
		},
		children: ["set", "append", "remove", "add", "subtract"],
	},
	set: {
		name: "set",
		action(entity, state, data) {
			let record = entity.model.schema.checkUpdate({ ...data });
			state.query.update.set = Object.assign(
				{},
				state.query.update.set,
				record,
			);
			return state;
		},
		children: ["set", "go", "params"],
	},
	// append: {
	// 	name: "append",
	// 	action(entity, state, data = {}) {
	// 		let attributes = {}
	// 		let payload = {};
	// 		for (let path of Object.keys(data)) {
	// 			let parsed = entity.model.schema.parseAttributePath(path);
	//
	// 		}
	// 	},
	// 	children: ["set", "append", "remove", "add", "subtract", "go", "params"]
	// },
	// remove: {
	// 	name: "remove",
	// 	action(entity, state, data) {
	//
	// 	},
	// 	children: ["set", "append", "remove", "add", "subtract", "go", "params"]
	// },
	// add: {
	// 	name: "add",
	// 	action(entity, state, data) {
	//
	// 	},
	// 	children: ["set", "append", "remove", "add", "subtract", "go", "params"]
	// },
	// subtract: {
	// 	name: "subtract",
	// 	action(entity, state, data) {
	//
	// 	},
	// 	children: ["set", "append", "remove", "add", "subtract", "go", "params"]
	// },
	query: {
		name: "query",
		action(entity, state, facets, options = {}) {
			state.query.keys.pk = entity._expectFacets(facets, state.query.facets.pk);
			entity._expectFacets(facets, Object.keys(facets), `"query" facets`);
			state.query.method = MethodTypes.query;
			state.query.type = QueryTypes.begins;
			if (state.query.facets.sk) {
				let queryFacets = entity._buildQueryFacets(facets, state.query.facets.sk);
				state.query.keys.sk.push({
					type: state.query.type,
					facets: queryFacets,
				});
			}
			return state;
		},
		children: ["between", "gte", "gt", "lte", "lt", "params", "go", "page"],
	},
	between: {
		name: "between",
		action(entity, state, startingFacets = {}, endingFacets = {}) {
			entity._expectFacets(
				startingFacets,
				Object.keys(startingFacets),
				`"between" facets`,
			);
			entity._expectFacets(
				endingFacets,
				Object.keys(endingFacets),
				`"and" facets`,
			);
			state.query.type = QueryTypes.between;
			let queryEndingFacets = entity._buildQueryFacets(
				endingFacets,
				state.query.facets.sk,
			);
			let queryStartingFacets = entity._buildQueryFacets(
				startingFacets,
				state.query.facets.sk,
			);
			state.query.keys.sk.push({
				type: QueryTypes.and,
				facets: queryEndingFacets,
			});
			state.query.keys.sk.push({
				type: QueryTypes.between,
				facets: queryStartingFacets,
			});
			return state;
		},
		children: ["go", "params", "page"],
	},
	gt: {
		name: "gt",
		action(entity, state, facets = {}) {
			entity._expectFacets(facets, Object.keys(facets), `"gt" facets`);
			state.query.type = QueryTypes.gt;
			let queryFacets = entity._buildQueryFacets(facets, state.query.facets.sk);
			state.query.keys.sk.push({
				type: state.query.type,
				facets: queryFacets,
			});
			return state;
		},
		children: ["go", "params", "page"],
	},
	gte: {
		name: "gte",
		action(entity, state, facets = {}) {
			entity._expectFacets(facets, Object.keys(facets), `"gte" facets`);
			state.query.type = QueryTypes.gte;
			let queryFacets = entity._buildQueryFacets(facets, state.query.facets.sk);
			state.query.keys.sk.push({
				type: state.query.type,
				facets: queryFacets,
			});
			return state;
		},
		children: ["go", "params", "page"],
	},
	lt: {
		name: "lt",
		action(entity, state, facets = {}) {
			entity._expectFacets(facets, Object.keys(facets), `"lt" facets`);
			state.query.type = QueryTypes.lt;
			let queryFacets = entity._buildQueryFacets(facets, state.query.facets.sk);
			state.query.keys.sk.push({
				type: state.query.type,
				facets: queryFacets,
			});
			return state;
		},
		children: ["go", "params", "page"],
	},
	lte: {
		name: "lte",
		action(entity, state, facets = {}) {
			entity._expectFacets(facets, Object.keys(facets), `"lte" facets`);
			state.query.type = QueryTypes.lte;
			let queryFacets = entity._buildQueryFacets(facets, state.query.facets.sk);
			state.query.keys.sk.push({
				type: state.query.type,
				facets: queryFacets,
			});
			return state;
		},
		children: ["go", "params", "page"],
	},
	params: {
		name: "params",
		action(entity, state, options = {}) {
			if (state.query.method === MethodTypes.query) {
				return entity._queryParams(state.query, options);
			} else {
				return entity._params(state.query, options);
			}
		},
		children: [],
	},
	go: {
		name: "go",
		action(entity, state, options = {}) {
			if (entity.client === undefined) {
				throw new Error("No client defined on model");
			}
			let params = {};
			if (state.query.method === MethodTypes.query) {
				params = entity._queryParams(state.query, options);
			} else {
				params = entity._params(state.query, options);
			}
			return entity.go(state.query.method, params, options);
		},
		children: [],
	},
	page: {
		name: "page",
		action(entity, state, page = null, options = {}) {
			options.page = page;
			options.pager = true;
			if (entity.client === undefined) {
				throw new Error("No client defined on model");
			}
			let params = {};
			if (state.query.method === MethodTypes.query) {
				params = entity._queryParams(state.query, options);
			} else {
				params = entity._params(state.query, options);
			}
			return entity.go(state.query.method, params, options);
		},
		children: []
	},
};

module.exports = {
	clauses,
};