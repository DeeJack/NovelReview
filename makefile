#!make

build: 
	@echo off && cd frontend && npm i
	@echo off && cd backend && npm i

frontend:
	@echo off && cd frontend && @echo off && npm run dev < nul

backend:
	@echo off && cd backend && @echo off && npm run dev < nul

.PHONY: frontend
.PHONY: backend
.PHONY: build