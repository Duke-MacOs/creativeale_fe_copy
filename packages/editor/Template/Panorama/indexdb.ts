import Dexie from 'dexie';
class VRUploadDatabase extends Dexie {
  VRUpload: Dexie.Table<{ id: number; files: File[] }, number>;

  constructor() {
    super('VRUploadDatabase');

    this.version(1).stores({
      VRUpload: 'id, files',
    });
    this.VRUpload = this.table('VRUpload');
  }
}

export const db = new VRUploadDatabase();
