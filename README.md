# SmartCompiler

SmartCompiler is a professional C++ compiler frontend built with React and Vite. It demonstrates the complete compilation process from source code to target assembly code, providing detailed insights into each compilation phase. This project serves as an educational tool and a demonstration of compiler frontend concepts implemented in a modern web application.

## Features

- Upload and edit C++ source files (.cpp, .cxx, .cc)
- Lexical Analysis (Tokenization)
- Syntax Analysis (Abstract Syntax Tree generation)
- Semantic Analysis with warnings for unused variables and functions
- Intermediate Code Generation
- Target Assembly Code Generation
- Error handling with detailed error and warning messages
- Interactive UI with tabs for source code and compilation results
- Accordion views for detailed compilation outputs

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd smartcompiler
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

- Start the development server with hot module replacement:
  ```bash
  npm run dev
  ```

- Build the project for production:
  ```bash
  npm run build
  ```

- Preview the production build locally:
  ```bash
  npm run preview
  ```

## Technologies Used

- React 19
- Vite
- Tailwind CSS
- Lucide React Icons
- ESLint for linting

## Project Structure

- `src/` - Source code including main React components
- `public/` - Static assets
- `package.json` - Project metadata and scripts
- `vite.config.js` - Vite configuration

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.

---

© 2025 SmartCompiler | Demonstration Project
