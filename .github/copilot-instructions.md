# GitHub Copilot Instructions

## Project Overview
This project is a portfolio management dashboard built with a React frontend, Node.js backend, and PostgreSQL database. It includes features for user authentication, investment management, and transaction tracking.

## Architecture
- **Frontend**: React
- **Backend**: Node.js with Express
- **Database**: PostgreSQL

## Developer Workflows
1. **Setting Up the Environment**: Ensure you have Node.js and PostgreSQL installed. Use the provided Dockerfiles for containerized environments.
2. **Running the Application**: Use the scripts defined in `package.json` to start the development server and run tests.
3. **Testing**: Use `vitest` for running tests. Ensure all tests pass before committing changes.

## Project-Specific Conventions
- **Schema Validation**: Use `zod` for schema validation in the backend. Refer to the schema files in the `src/schema` directory for examples.
- **Code Structure**: Follow the existing directory structure for organizing code. Use the `src` directory for source code, `__tests__` for tests, and `db` for database-related files.

## Integration Points
- **API Endpoints**: Refer to the `README.md` for a list of available API endpoints and their usage.
- **Database Migrations**: Use the provided SQL files for initializing and updating the database schema.

## Best Practices
- Write clear and concise commit messages.
- Ensure code is well-documented and follows the project's coding standards.
- Regularly pull changes from the main branch to keep your branch up to date.

## Troubleshooting
- If you encounter issues, check the logs for errors and refer to the documentation for guidance.
- Reach out to the team for assistance if needed.