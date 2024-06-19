import { Novel } from "../Novel";

export interface Source {
    /**
     * Download an image, so that it can be shown in the library
     * @param imageUrl The direct url for the image
     * @param destinationPath The path where the image is stored
     */
    downloadImage(imageUrl: string, destinationPath: string): Promise<void>;

    /**
     * Search for a list of novels based on the keywords
     * @param keywords The query that is used for the search
     */
    search(keywords: string): Promise<Novel[]>
}