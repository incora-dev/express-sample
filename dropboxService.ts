import { Dropbox } from 'dropbox';
import axios from 'axios';

import { ExportDocumentData } from '../interfaces/document';
import { parseFileExtension } from '../utils/file';
import * as utils from '../shared/utilities';

export class DropboxService {
  protected dbxOauth: Dropbox

  constructor(config: Record<'clientId' | 'clientSecret', string> = cfg.dropboxAPI) {
    const { clientId, clientSecret } = config;

    this.dbxOauth = new Dropbox({ clientId });
    this.dbxOauth.setClientSecret(clientSecret);
    this.downloadDocument = this.downloadDocument.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
  }

  protected async getClient(accessToken: string) {
    const dbxClient = new Dropbox({ accessToken });

    return dbxClient;
  }

  public async getToken(code: string, redirectUri: string) {
    const token = await this.dbxOauth.getAccessTokenFromCode(redirectUri, code);

    return token;
  }

  public async getCurrentUser(accessToken: string) {
    const dcxClient = await this.getClient(accessToken);
    const user = await dcxClient.usersGetCurrentAccount(null);

    return user;
  }

  public async getDocuments(
    accessToken: string,
    parentId: string = '',
    ext?: string,
  ) {
    const dcxClient = await this.getClient(accessToken);
    const { entries, cursor, has_more } = await dcxClient.filesListFolder({
      path: parentId,
      recursive: false,
      include_deleted: false,
      include_media_info: false,
      limit: 2000,
    });

    const documents = entries.map(doc => ({
      ...doc,
      parentId,
      isFolder: doc['.tag'] === 'folder',
    }));

    return ext
      ? documents.filter(doc => doc.isFolder || parseFileExtension(doc.name) === ext)
      : documents;
  }

  public async downloadDocument(accessToken: string, fileId: string) {
    const dcxClient = await this.getClient(accessToken);

    const { link } = await dcxClient.filesGetTemporaryLink({ path: fileId });
    const { data: fileStream } = await axios.get(link, { responseType: 'stream' });

    return await utils.convertStreamToBuffer(fileStream);
  }


  public async uploadFile(
    accessToken: string,
    document: ExportDocumentData,
    pdfCertificate: Buffer,
  ) {
    const { filename, sourceData } = document;
    const { parentId, parent_id } = sourceData;
    const folder = parentId || parent_id;

    const dcxClient = await this.getClient(accessToken);
    return dcxClient.filesUpload({
      path: `${folder}/${filename}`,
      contents: pdfCertificate,
    });
  }

  public async deleteFile(
    accessToken: string,
    fileId: string,
  ) {
    const dcxClient = await this.getClient(accessToken);
    
    return dcxClient.filesDelete({
      path: fileId,
    });
  }
}

export default new DropboxService();
