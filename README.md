# NovelReview

NovelReview is a website where you can write reviews for novels available on WebNovel and MTLnovel.

## Overview

NovelReview offers several features:

- Search for novels on WebNovel.com and MTLNovel.com
- Add novels to your library
- Provide details like the last chapter read, tags, and your review
- Search and sort your library based on title, tags, and description

## Changes in version 0.1

- Separated the backend in different files for clarity
- Migrated to TypeScript the backend
- Fixed a few minor bugs (height of images in library, "show more" button)

## TO DO

- [ ] Add support for movies
- [ ] Add support for anime
- [x] Use Docker: dropped. It gave a lot of problems with puppeteer. It's not worth it.
- [x] Show loading animation when loading the edit page
- [x] Show images when showing WebNovel: doesn't work. I can save the images temporarily, based on the hash of the URL. It's not worth it, a lot of requests made, and pages opened, for temporary results.
- [x] Try with browser if search fail with axios
- [x] Fix adding to the library somehow not working (replaced the last novel with the new one/not added at all)
- [ ] Figure out a way to fix the IP thing, since when using it outside localhost it can't reach localhost

## Prerequisites

- NodeJS

## Instructions

To get started:

1. Clone the repository: `git clone https://github.com/DeeJack/NovelReview`
2. Run the server in the backend directory: `npm run dev`
3. Run the frontend in the frontend directory: `npm run dev`
4. [Optional]: use make to run them: `make frontend[/backend]`

Once done, access the frontend from `http://localhost:5173/` (by default).

## Technologies Used

- VueJS: Frontend development
- NodeJS + Express: Backend development
- SQLite: Local database storage

## Screenshots

![Library](readme/images/library.png)

![Search results](readme/images/search.png)

## License

For licensing information, refer to [LICENSE](LICENSE) file.
