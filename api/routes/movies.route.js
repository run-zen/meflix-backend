import express from "express";
import MoviesCtrl from "../controllers/movies.controller.js";
const router = express.Router();

router.route("/browseMovies").get(MoviesCtrl.apiGetMovies);
router.route('/quicksearch/:name').get(MoviesCtrl.apiQuickSearch);

router.route("/genres").get(MoviesCtrl.apiGetMoviesGenres);
router.route("/id/:id").get(MoviesCtrl.apiGetMovieById);

export default router;
