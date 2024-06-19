export class Novel {
    /**
     * The URL of the novel
     */
    url: string;
    /**
     * The title of the novel
     */
    title: string;
    /**
     * The URL for the image of the novel
     */
    image: string;
    /**
     * The source of the novel (MTL, Webnovel, etc.)
     */
    source: string;
    /**
     * The ID of the novel in the database
     */
    id?: number;
    /**
     * The rating of the novel (out of 10)
     */
    rating?: number;
    /**
     * The text for the review
     */
    review?: string;
    /**
     * The latest chapter read
     */
    chapter?: number;
    /**
     * Chapters with kisses (separated by comma)
     */
    kisses?: string;
    /**
     * Tags for the novel (separated by comma)
     */
    tags?: string
}