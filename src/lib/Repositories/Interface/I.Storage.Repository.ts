export interface IStorageRepository {
  createFile(file: File): Promise<string>;
  getFile(file: string): Promise<string>;
  getFiles(): Promise<string[]>;
  updateFile(file: File, oldFile: string): Promise<string>;
  deleteFile(file: string): Promise<boolean>;
}
