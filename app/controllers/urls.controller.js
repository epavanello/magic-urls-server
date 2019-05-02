import BaseController from './base.controller';
import Url from '../models/url';

class UrlController extends BaseController {

	whitelist = [
		'address',
		'alias',
	];

	// Middleware to populate url based on url param
	_populate = async (req, res, next) => {
		const { id } = req.params;

		try {
			const url = await Url.findById(id);

			if (!url) {
				const err = new Error('Url not found.');
				err.status = 404;
				return next(err);
			}

			req.url = url;
			next();
		} catch (err) {
			err.status = err.name === 'CastError' ? 404 : 500;
			next(err);
		}
	}

	search = async (req, res, next) => {
		try {
			const urls =
				await Url.find({})
					.populate({ path: '_user', select: '-urls -role' });

			res.json(urls);
		} catch (err) {
			next(err);
		}
	}

	/**
	 * req.url is populated by middleware in routes.js
	 */

	fetch = (req, res) => {
		res.json(req.url);
	}

	/**
	 * req.user is populated by middleware in routes.js
	 */

	create = async (req, res, next) => {
		const params = this.filterParams(req.body, this.whitelist);

		const url = new Url({
			...params,
			_user: req.currentUser._id,
		});

		try {
			res.status(201).json(await url.save());
		} catch (err) {
			next(err);
		}
	}

	delete = async (req, res, next) => {
		/**
		 * Ensure the user attempting to delete the url owns the url
		 *
		 * ~~ toString() converts objectIds to normal strings
		 */
		if (req.url._user.toString() === req.currentUser._id.toString()) {
			try {
				await req.url.remove();
				res.sendStatus(204);
			} catch (err) {
				next(err);
			}
		} else {
			res.sendStatus(403);
		}
	}

	deleteAll = async (req, res, next) => {
		/**
		 * Ensure the user attempting to delete the url owns the url
		 *
		 * ~~ toString() converts objectIds to normal strings
		 */
		if (req.url._user.toString() === req.currentUser._id.toString()) {
			try {
				await req.url.remove();
				res.sendStatus(204);
			} catch (err) {
				next(err);
			}
		} else {
			res.sendStatus(403);
		}
	}
}

export default new UrlController();
