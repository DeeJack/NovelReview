#!make

frontend:
	@echo off && cd frontend && npm i && npm run dev

backend:
	@echo off && cd backend && npm i && npm run dev

.PHONY: frontend
.PHONY: backend