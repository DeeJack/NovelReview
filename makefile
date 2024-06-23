#!make

build: 
	cd frontend && npm i --include=dev
	cd backend && npm i --include=dev

frontend:
	cd frontend && npm run dev < nul

backend:
	cd backend && npm run dev < nul

all:
	cd frontend && npm run build
	cd backend && npm run build
	cd backend && npm run start

linux:
	cd frontend && npm run build
	cd backend && npm run build
	cd backend && xvfb-run -a npm run start

.PHONY: frontend
.PHONY: backend
.PHONY: build
.PHONY: all
.PHONY: linux