import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;
let movies;

export default class MoviesDAO {
    static async injectDB(conn) {
        if (movies) {
            return;
        }
        try {
            movies = await conn.db(process.env.DB).collection("movies");
            console.log(`established connection with "movies" collection`);
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in restaurantsDAO: ${e}`
            );
        }
    }

    static async getGenres() {
        let cursor;
        try {
            const pipeline = [
                {
                    $unwind: {
                        path: "$genres",
                    },
                },
                {
                    $group: {
                        _id: "$genres",
                        count: { $sum: 0 },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
                {
                    $group: {
                        _id: "$count",
                        genres: { $push: "$_id" },
                    },
                },
            ];

            cursor = await movies.aggregate(pipeline).next();
            return cursor;
        } catch (e) {
            console.error(`Unable to get cuisines, ${e}`);
            return;
        }
    }

    static async getMovieByID(id) {
        try {
            const pipeline = [
                {
                    $match: {
                        _id: new ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: "comments",
                        let: {
                            id: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$movie_id", "$$id"],
                                    },
                                },
                            },
                            {
                                $sort: {
                                    date: -1,
                                },
                            },
                        ],
                        as: "reviews",
                    },
                },
                {
                    $addFields: {
                        reviews: "$reviews",
                    },
                },
            ];
            return await movies.aggregate(pipeline).next();
        } catch (e) {
            console.error(`Something went wrong in getRestaurantByID: ${e}`);
            throw e;
        }
    }

    static async getMovies({ page = 1, filters }) {
        let query;
        let project = { title: 1, genres: 1, "imdb.rating": 1, released: 1 };
        let sort = {};
        if (!filters) {
            query = {};
        } else {
            query = { $and: [] };
            if ("name" in filters) {
                query["$and"].push({
                    title: { $regex: new RegExp("^" + filters.name, "i") },
                });
            }
            if ("genre" in filters) {
                query["$and"].push({ genres: { $in: [filters.genre] } });
            }
            if ("rating" in filters) {
                query["$and"].push({
                    "imdb.rating": { $gte: parseFloat(filters.rating) },
                });
            }
            if ("sortby" in filters) {
                if (filters.sortby === "oldreleased") {
                    sort["released"] = 1;
                } else if (filters.sortby === "newreleased") {
                    sort["released"] = -1;
                } else {
                    sort[filters.sortby] = -1;
                }
            } else {
                sort["imdb.rating"] = -1;
            }
            if ("language" in filters) {
                query["$and"].push({ languages: { $in: [filters.language] } });
            }
        }
        //console.log(`search query : ${filters.sortby}`);
        let cursor;
        try {
            cursor = await movies.find(query);
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`);
            return;
        }

        const displayCursor = cursor
            .sort(sort)
            .skip((page - 1) * 20)
            .limit(20);

        try {
            const moviesList = await displayCursor.toArray();
            const totalMovies = await movies.countDocuments(query);
            return { moviesList, totalMovies };
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`
            );
            return {};
        }

        // {$and:[{$text:{$search:filters.name}},{genres:{$in:filters.genre}},{"imdb.rating":{$gte: filters.rating}}]}
    }

    static async quickSearch({ page = 1, filters }) {
        let query;
        let searchname;
        let project = { title: 1, genres: 1, "imdb.rating": 1, released: 1 };
        if ("name" in filters) {
            searchname = "^" + filters.name;
        } else {
            searchname = "^";
        }
        query = { title: { $regex: new RegExp(searchname, "i") } };

        let cursor;

        try {
            cursor = await movies.find(query);
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`);
            return;
        }

        let displayCursor = cursor
            .sort({ "imdb.rating": -1 })
            .skip((page - 1) * 20)
            .limit(20);

        try {
            const moviesList = await displayCursor.toArray();
            const totalMovies = await movies.countDocuments(query);

            return { moviesList, totalMovies };
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`
            );
            return { status: "error" };
        }
    }
}
