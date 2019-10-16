import { Router } from 'express';

import dropboxController from '../../controllers/dropboxController';
import requireHeader from '../../middlewares/requireHeader';
import * as multipart from 'connect-multiparty';

const multipartMiddleware = multipart();
const { authTokenName } = cfg.dropboxAPI;
const NO_TOKEN_ERROR = 'Your access token to Dropbox has expired or does not exist';

const router = Router();
const requireTokenHeader = requireHeader(authTokenName, NO_TOKEN_ERROR);

/**
 * @api {post} /private/dropbox/auth Auth to Dropbox
 * @apiName Dropbox Auth
 * @apiGroup Dropbox
 *
 */
router.post(
  '/auth',
  dropboxController.authorizeUser
);

/**
 * Used to verify user authorization
 *
 * @api {get} /private/dropbox/me User info from Dropbox
 * @apiName Dropbox User
 * @apiGroup Dropbox
 *
 * @apiHeader {String} x-dropbox-token Access token
 *
 */
router.get(
  '/me',
  requireHeader(authTokenName, NO_TOKEN_ERROR, 200),
  dropboxController.getCurrentUser
);

/**
 * @api {get} /private/dropbox/docs Docs from Dropbox
 * @apiName Dropbox Docs
 * @apiGroup Dropbox
 *
 * @apiHeader {String} x-dropbox-token Access token
 *
 */
router.get(
  '/docs',
  requireTokenHeader,
  dropboxController.getDocuments
);

/**
 * @api {post} /private/dropbox/register Register docs from Dropbox
 * @apiName Dropbox Register docs
 * @apiGroup Dropbox
 *
 * @apiHeader {String} x-dropbox-token Access token
 *
 */
router.post(
  '/register',
  requireTokenHeader,
  dropboxController.registerDocument
);

/**
 * @api {post} /private/dropbox/save Save certificate to Dropbox
 * @apiName Dropbox Save certificate
 * @apiGroup Dropbox
 *
 * @apiHeader {String} x-dropbox-token Access token
 *
 */
router.post(
  '/save',
  requireTokenHeader,
  dropboxController.saveDocument
);

/**
 * @api {post} /private/dropbox/upload Upload document to Dropbox
 * @apiName Dropbox Upload document
 * @apiGroup Dropbox
 *
 * @apiHeader {String} x-dropbox-token Access token
 *
 */
router.post(
  '/upload',
  requireTokenHeader,
  dropboxController.uploadDocument,
);

/**
 * @api {post} /private/dropbox/sign-pdf Sign Dropbox pdf
 * @apiName Sign Dropbox pdf
 * @apiGroup Dropbox
 *
 * @apiHeader {String} x-dropbox-token Access token
 *
 */
router.post(
  '/sign-pdf',
  multipartMiddleware,
  dropboxController.signPdf,
)

module.exports = router;
