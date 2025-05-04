# Project Setup Instructions

## Frontend Development
1. Open the `index.html` file in VS Code using Live Server
2. Navigate to the `frontend` folder in your terminal
3. Run `npm run watch` to automatically transpile TypeScript files during development

## Frontend Deployment
- Run `npm run build` to transpile all TypeScript files to JavaScript before deployment

## Backend Development
1. Set up your `.env.development` file (refer to `env.example` for required variables)
2. Run `npm run dev` to start the development server

## Backend Production
1. Set up your `.env.production` file (refer to `env.example` for required variables)
2. Run `tsc` to transpile TypeScript files to JavaScript
3. Run `npm run prod` to start the production server

## Important Note
**!!! HIGH ALERT !!!**  
Avoid using `any` or `unknown` as variable types unless absolutely necessary and properly justified. Always prefer proper type annotations.