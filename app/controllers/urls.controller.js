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

	go = async (req, res) => {
		const { alias } = req.params;

		try {
			let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

			const url = await Url.find({ alias });
			if (!url) {
				new Error('Url not found.');
			}
			url[0]._views = url[0]._views.concat([{ ip, date: Date.now() }]);
			await url[0].save();
			res.redirect(url[0].address);
		} catch (err) {
			res.status(500).send(err.message || 'Internal Server Error.');
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

		function stringGen(len) {
			let text = '';

			let charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

			for (let i = 0; i < len; i++)
				text += charset.charAt(Math.floor(Math.random() * charset.length));

			return text;
		}

		if (!params['alias']) {
			let alias = '';
			do {
				alias = stringGen(5);
			} while (await Url.count({ alias }) > 0);
			params['alias'] = alias;
		}

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
		try {
			await Url.remove({
				_user: req.currentUser._id,
			});
			res.sendStatus(204);
		} catch (err) {
			next(err);
		}
	}
}

export default new UrlController();
