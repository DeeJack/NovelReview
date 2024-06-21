#!make

build: 
	cd frontend && npm i --include=dev
	cd backend && npm i --include=dev

frontend:
	cd frontend && npm run dev < nul

backend:
	cd backend && npm run dev < nul

.PHONY: frontend
.PHONY: backend
.PHONY: build