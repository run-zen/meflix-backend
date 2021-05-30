import { query } from "express";
import MoviesDAO from "../../DAO/moviesDAO.js";

export default class MoviesController {
    static async apiGetMoviesGenres(req, res, next) {
        try {
            let cuisines = await MoviesDAO.getGenres();
            let response = {
                cuisinesList: cuisines,
            };
            res.status(200).json(response);
        } catch (e) {
            console.log(`api, ${e}`);
            res.status(500).json({ error: e });
        }
    }
    static async apiGetMovieById(req, res, next) {
        try {
            let id = req.params.id || {};
            let movie = await MoviesDAO.getMovieByID(id);
            if (!movie) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            res.json(movie);
        } catch (e) {
            console.log(`api, ${e}`);
            res.status(500).json({ error: e });
        }
    }
    static async apiGetMovies(req, res, next) {
        try {
            let filters = { rating: 0 };

            let page = 0;
            if (req.query.page) {
                page = req.query.page;
            }
            if (req.query.name) {
                filters.name = req.query.name;
            }
            if (req.query.rating) {
                filters.rating = req.query.rating;
            }
            if (req.query.genre) {
                filters.genre = req.query.genre;
            }
            if (req.query.sortby) {
                filters.sortby = req.query.sortby;
            }
            if (req.query.language) {
                filters.language = req.query.language;
            }
            console.log(`filters : ${filters}`);
            const { moviesList, totalMovies } = await MoviesDAO.getMovies({
                page,
                filters,
            });

            let response = {
                page: page,
                "Movies found": totalMovies,
                MoviesList: moviesList,
            };

            res.status(200).json(response);
        } catch (e) {
            console.error(`Unable to get movies due to : ${e}`);
            res.status(404).json({ success: false });
        }
    }
    static async apiQuickSearch(req, res, next) {
        try {
            let page = req.query.page ? req.query.page : 1;
            let name = req.params.name;
            let filters = {
                name: name,
            };

            const { moviesList, totalMovies } = await MoviesDAO.quickSearch({
                page,
                filters,
            });

            let response = {
                page: page,
                "Movies found": totalMovies,
                MoviesList: moviesList,
            };

            res.status(200).json(response);
        } catch (e) {
            console.error(`Unable to get movies due to : ${e}`);
            res.status(404).json({ success: false });
        }
    }
}
