import { StorageRepository } from "$lib/Repositories/Implementation/Storage.Repository";

const storageRepository = new StorageRepository();

export async function ImageToUrl(file: File): Promise<string> {
  try {
     const storedImage = await storageRepository.createFile(file);
    return storedImage;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
