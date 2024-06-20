#!make

frontend:
	cd frontend && npm i && npm run dev

backend:
	cd backend && npm i && npm run dev

.PHONY: frontend
.PHONY: backend