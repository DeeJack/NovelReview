# NovelReview

NovelReview is a website where you can write reviews for novels available on WebNovel and MTLnovel.

## Overview

NovelReview offers several features:

- Search for novels on WebNovel.com and MTLNovel.com
- Add novels to your library
- Provide details like the last chapter read, tags, and your review
- Search and sort your library based on title, tags, and description

## Changes in version 0.2

- Separated the backend in different files for clarity
- Migrated to TypeScript the backend
- Fixed a few minor bugs (height of images in library, "show more" button)
- Added HTTPS
- Added Authentication

## TO DO

- [x] Add HTTPS
- [ ] Add an animation when loading edit page to prevent user from clicking other stuff.
- [x] Add password request for modifications, to prevent unwanted requests.

## Prerequisites

- NodeJS

## Instructions

### Installation

To get started:

- Clone the repository: `git clone https://github.com/DeeJack/NovelReview`

### Configuration

frontend/.env [OPTIONAL] [example in [frontend/.env-example](frontend/.env-example)]:

- Set the server's IP address (if they are not in the same host):
   1. Create a `.env` file in the `frontend/` directory
   2. Set the `VITE_API_URL` to the IP address for the server. By default, the value will be set to `http://127.0.0.1:3000` (only local)
   3. Set `VITE_PORT` to change the frontend's port (default: 5000)

backend/.env [example in [backend/.env-example](backend/.env-example)]:

1. [REQUIRED] Set BCrypt's secret key: create a `.env` file in the `backend/` directory, and set the `JWT_SECRET` to a random private key (any alphanumeric string).
2. [OPTIONAL] Set the backend's port: set `PORT=3000`, or whichever port you prefer (3000 by default)
3. [OPTIONAL] Set `USE_HTTPS=true` if you want the server to use HTTPS. 
   The key needs to be in `ssl/server.key` (in the root folder of the project, `NovelReview` by default, not in `backend/`)
   The certificate is in `ssl/server.cert`

### Run the web app

1. Build the frontend: `npm run build` in `frontend/`
2. Build the backend: `npm run build` in `backend/`
3. Run the backend: `npm run start` in `backend/`

### Run web app with make

If you have make:

1. Build the project: `make build` in the root directory
2. Run the project: `make all` in the root directory
3. [OPTIONAL] To run the dev version (with automatic reload on changes): `make frontend` (or backend).

### Access the app

Once done, access the frontend from `http://localhost:5000/` (by default).

### Puppeteer on Linux

You need to install all the libraries listed on the file [install_linux.sh](install_linux.sh).

Then, if you are using a computer that doesn't have a display (probably a VPS), you need to use the commands:

1. `Xvfb&` (not sure if needed)
2. `npm run build`, `xvfb-run -a node dist/Server.js`, this will create a virtual display for the browser.

## Technologies Used

- VueJS: Frontend development
- NodeJS + Express: Backend development
- SQLite: Local database storage

## Screenshots

| Library pc                            | Search pc                            |
| ----------------------                | ----------------------               |
| ![Library](readme/images/library.png) | ![Search](readme/images/search.png) |

| Library phone                          | Search phone                        |
| ----------------------                 | ----------------------              |
| ![Library](readme/images/mobile.png)   | ![Search](readme/images/mobile2.png) |

## License

For licensing information, refer to [LICENSE](LICENSE) file.
