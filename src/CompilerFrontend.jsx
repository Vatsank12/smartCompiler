import { useState } from 'react';
import { AlertCircle, CheckCircle, Upload, Play, Code, Book, Server, X, ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function CompilerFrontend() {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [compileResult, setCompileResult] = useState(null);
  const [activeTab, setActiveTab] = useState('code');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is C++
      if (!selectedFile.name.endsWith('.cpp') && !selectedFile.name.endsWith('.cxx') && !selectedFile.name.endsWith('.cc')) {
        alert('Please upload a C++ file (.cpp, .cxx, .cc)');
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleCompile = () => {
    if (!code) return;
    
    setLoading(true);
    // Simulate C++ compilation process
    setTimeout(() => {
      try {
        // Check for basic C++ syntax
        const hasMainFunction = code.includes('int main(') || code.includes('void main(');
        const hasIncludes = code.includes('#include');
        const hasSemicolonErrors = checkForSemicolonErrors(code);
        const hasBracketErrors = checkForBracketErrors(code);
        const hasFunctionErrors = checkFunctionDeclarations(code);
        
        // Generate compilation results
        const result = {
          success: hasMainFunction && !hasSemicolonErrors.length && !hasBracketErrors.length && !hasFunctionErrors.length,
          tokens: generateCppTokens(code),
          ast: generateCppAST(code),
          errors: [
            ...(!hasMainFunction ? [{ line: findMainFunctionLine(code), message: 'Missing main function' }] : []),
            ...hasSemicolonErrors,
            ...hasBracketErrors,
            ...hasFunctionErrors,
          ],
          intermediateCode: generateIntermediateCode(code),
          semanticAnalysis: performSemanticAnalysis(code),
          targetCode: generateTargetCode(code)
        };
        
        setCompileResult(result);
      } catch (error) {
        setCompileResult({
          success: false,
          errors: [{ line: 0, message: `Compilation error: ${error.message}` }],
          tokens: [],
          ast: {},
          intermediateCode: '',
          semanticAnalysis: {},
          targetCode: ''
        });
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const checkForSemicolonErrors = (code) => {
    const lines = code.split('\n');
    const errors = [];
    let inMultiLineComment = false;
    
    lines.forEach((line, index) => {
      // Handle multi-line comments
      if (line.includes('/*')) inMultiLineComment = true;
      if (line.includes('*/')) inMultiLineComment = false;
      
      if (inMultiLineComment) return;
      
      const trimmed = line.trim();
      // Skip empty lines, preprocessor directives, comments, and lines ending with {
      if (!trimmed || 
          trimmed.startsWith('#') || 
          trimmed.startsWith('//') || 
          trimmed.endsWith('{') || 
          trimmed.endsWith('}') ||
          trimmed.startsWith('}') ||
          trimmed.includes('namespace ') ||
          trimmed.includes('class ') ||
          trimmed.includes('struct ') ||
          trimmed.includes('enum ') ||
          trimmed.includes('typedef ') ||
          trimmed.includes('using ') ||
          trimmed.includes('template ') ||
          trimmed.includes('return ') ||
          trimmed.includes('if ') ||
          trimmed.includes('else ') ||
          trimmed.includes('for ') ||
          trimmed.includes('while ') ||
          trimmed.includes('do ') ||
          trimmed.includes('switch ') ||
          trimmed.includes('case ') ||
          trimmed.includes('default:')) {
        return;
      }
      
      // Check for missing semicolon
      if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
        // Check if this is a function declaration
        const isFunction = trimmed.match(/(\w+\s+)?\w+\s*\([^)]*\)(\s*const)?\s*(=\s*0)?\s*$/);
        if (!isFunction) {
          errors.push({ line: index + 1, message: 'Missing semicolon' });
        }
      }
    });
    
    return errors;
  };

  const checkForBracketErrors = (code) => {
    const stack = [];
    const lines = code.split('\n');
    const errors = [];
    
    lines.forEach((line, lineNum) => {
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '{') {
          stack.push({ char, line: lineNum + 1 });
        } else if (char === '}') {
          if (stack.length === 0) {
            errors.push({ line: lineNum + 1, message: 'Unmatched closing bracket' });
          } else {
            stack.pop();
          }
        }
      }
    });
    
    if (stack.length > 0) {
      errors.push({ line: stack[0].line, message: 'Unmatched opening bracket' });
    }
    
    return errors;
  };

  const checkFunctionDeclarations = (code) => {
    const errors = [];
    const lines = code.split('\n');
    
    // Check for function declarations without implementation
    const functionDeclarations = code.match(/\w+\s+\w+\s*\([^)]*\)\s*(?=\{)/g) || [];
    const functionPrototypes = code.match(/\w+\s+\w+\s*\([^)]*\)\s*;/g) || [];
    
    // Check for mismatched function declarations/definitions
    functionPrototypes.forEach(proto => {
      const fnName = proto.split(/\s+/)[1].split('(')[0];
      const hasDefinition = functionDeclarations.some(decl => decl.includes(fnName + '('));
      
      if (!hasDefinition && !proto.includes(';')) {
        const line = findLineNumber(code, proto);
        errors.push({ line, message: `Function '${fnName}' declared but not defined` });
      }
    });
    
    return errors;
  };

  const findMainFunctionLine = (code) => {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('int main(') || lines[i].includes('void main(')) {
        return i + 1;
      }
    }
    return 0;
  };

  const generateCppTokens = (code) => {
    // Improved C++ tokenization
    const lines = code.split('\n');
    let lineNumber = 1;
    const tokens = [];
    
    const cppKeywords = [
      'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor',
      'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t', 'char32_t',
      'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'const_cast',
      'continue', 'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete',
      'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern',
      'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long',
      'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator',
      'or', 'or_eq', 'private', 'protected', 'public', 'register', 'reinterpret_cast',
      'requires', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert',
      'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local', 'throw',
      'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using',
      'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
    ];
    
    lines.forEach(line => {
      // Skip comments
      if (line.trim().startsWith('//')) {
        lineNumber++;
        return;
      }
      
      // Handle multi-line comments
      if (line.includes('/*') || line.includes('*/')) {
        lineNumber++;
        return;
      }
      
      // Tokenize preprocessor directives
      if (line.trim().startsWith('#')) {
        tokens.push({
          value: line.trim(),
          type: 'preprocessor',
          line: lineNumber
        });
        lineNumber++;
        return;
      }
      
      // Improved tokenization that handles more C++ syntax
      const words = line.split(/(\s+|;|{|}|\(|\)|\[|\]|,|\.|:|&|\||\^|~|!|\+|-|\*|\/|%|=|>|<|"|'|\\|\?)/)
        .filter(token => token.trim() !== '');
      
      words.forEach(word => {
        if (word.trim()) {
          let type = 'identifier';
          
          if (cppKeywords.includes(word)) {
            type = 'keyword';
          } else if (['+', '-', '*', '/', '%', '=', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!', '++', '--', '+=', '-=', '*=', '/=', '%=', '<<', '>>'].includes(word)) {
            type = 'operator';
          } else if (!isNaN(word) || word.startsWith('"') || word.startsWith("'")) {
            type = 'literal';
          } else if (word === ';' || word === '{' || word === '}' || word === '(' || word === ')' || word === '[' || word === ']') {
            type = 'punctuation';
          } else if (word.startsWith('//') || word.startsWith('/*')) {
            type = 'comment';
          } else if (word.match(/^[0-9]+(\.[0-9]+)?$/)) {
            type = 'number';
          } else if (word.match(/^"[^"]*"$/)) {
            type = 'string';
          }
          
          tokens.push({
            value: word,
            type,
            line: lineNumber
          });
        }
      });
      
      lineNumber++;
    });
    
    return tokens;
  };

  const generateCppAST = (code) => {
    // Parse the code to generate a more accurate AST
    const lines = code.split('\n');
    const ast = {
      type: 'Program',
      body: []
    };
    
    // Parse includes
    const includes = lines.filter(line => line.trim().startsWith('#include'));
    includes.forEach(include => {
      ast.body.push({
        type: 'IncludeDirective',
        value: include.trim()
      });
    });
    
    // Parse functions
    const functionRegex = /(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
    let match;
    while ((match = functionRegex.exec(code)) !== null) {
      const returnType = match[1];
      const name = match[2];
      const params = match[3].split(',').map(param => {
        const parts = param.trim().split(/\s+/);
        return {
          type: parts[0],
          name: parts[1] || ''
        };
      });
      
      // Find function body
      const startLine = match.index;
      let braceCount = 1;
      let endIndex = match.index + match[0].length;
      
      while (braceCount > 0 && endIndex < code.length) {
        if (code[endIndex] === '{') braceCount++;
        if (code[endIndex] === '}') braceCount--;
        endIndex++;
      }
      
      const body = code.substring(match.index + match[0].length, endIndex - 1);
      
      ast.body.push({
        type: 'FunctionDeclaration',
        name,
        returnType,
        params,
        body: parseFunctionBody(body)
      });
    }
    
    // Parse variable declarations
    const varRegex = /(int|float|double|char|bool|auto)\s+(\w+)\s*(=\s*[^;]*)?\s*;/g;
    while ((match = varRegex.exec(code)) !== null) {
      ast.body.push({
        type: 'VariableDeclaration',
        varType: match[1],
        name: match[2],
        value: match[3] ? match[3].substring(1).trim() : undefined
      });
    }
    
    return ast;
    
    function parseFunctionBody(body) {
      const statements = [];
      const lines = body.split('\n');
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//')) return;
        
        // Parse variable declarations in function body
        const varMatch = trimmed.match(/(int|float|double|char|bool|auto)\s+(\w+)\s*(=\s*[^;]*)?\s*;/);
        if (varMatch) {
          statements.push({
            type: 'VariableDeclaration',
            varType: varMatch[1],
            name: varMatch[2],
            value: varMatch[3] ? varMatch[3].substring(1).trim() : undefined
          });
          return;
        }
        
        // Parse return statements
        if (trimmed.startsWith('return')) {
          statements.push({
            type: 'ReturnStatement',
            value: trimmed.substring(6).replace(';', '').trim()
          });
          return;
        }
        
        // Parse expressions
        if (trimmed.endsWith(';')) {
          statements.push({
            type: 'ExpressionStatement',
            expression: trimmed.replace(';', '')
          });
        }
      });
      
      return statements;
    }
  };

  const generateIntermediateCode = (code) => {
    // Generate intermediate code based on actual code structure
    const ast = generateCppAST(code);
    const intermediate = [];
    
    ast.body.forEach(node => {
      if (node.type === 'FunctionDeclaration') {
        intermediate.push(`FUNCTION ${node.name}:`);
        
        // Process function parameters
        node.params.forEach((param, index) => {
          intermediate.push(`  PARAM ${param.name}`);
        });
        
        // Process function body
        node.body.forEach(stmt => {
          if (stmt.type === 'VariableDeclaration') {
            if (stmt.value) {
              intermediate.push(`  T${intermediate.length} = ${stmt.value}`);
              intermediate.push(`  ${stmt.name} = T${intermediate.length - 1}`);
            } else {
              intermediate.push(`  ALLOCATE ${stmt.name}`);
            }
          } else if (stmt.type === 'ReturnStatement') {
            intermediate.push(`  RETURN ${stmt.value}`);
          } else if (stmt.type === 'ExpressionStatement') {
            // Simple expression handling
            const expr = stmt.expression;
            
            // Handle assignments
            if (expr.includes('=')) {
              const [left, right] = expr.split('=').map(s => s.trim());
              intermediate.push(`  T${intermediate.length} = ${right}`);
              intermediate.push(`  ${left} = T${intermediate.length - 1}`);
            } else {
              intermediate.push(`  EVAL ${expr}`);
            }
          }
        });
      }
    });
    
    return intermediate.join('\n');
  };

  const performSemanticAnalysis = (code) => {
    const ast = generateCppAST(code);
    const analysis = {
      variables: [],
      functions: [],
      types: [],
      warnings: []
    };
    
    // Collect variables
    ast.body.forEach(node => {
      if (node.type === 'VariableDeclaration') {
        analysis.variables.push({
          name: node.name,
          type: node.varType,
          line: findLineNumber(code, node.name)
        });
      }
    });
    
    // Collect functions
    ast.body.forEach(node => {
      if (node.type === 'FunctionDeclaration') {
        analysis.functions.push({
          name: node.name,
          returnType: node.returnType,
          params: node.params,
          line: findLineNumber(code, node.name)
        });
      }
    });
    
    // Check for unused variables
    analysis.variables.forEach(variable => {
      const varName = variable.name;
      const varUsed = code.split(varName).length > 2; // More than just the declaration
      
      if (!varUsed) {
        analysis.warnings.push({
          line: variable.line,
          message: `Unused variable '${varName}'`
        });
      }
    });
    
    // Check for function usage
    analysis.functions.forEach(func => {
      if (func.name !== 'main') {
        const funcUsed = code.split(`${func.name}(`).length > 2; // More than just the declaration
        
        if (!funcUsed) {
          analysis.warnings.push({
            line: func.line,
            message: `Unused function '${func.name}'`
          });
        }
      }
    });
    
    return analysis;
  };

  const findLineNumber = (code, text) => {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(text)) {
        return i + 1;
      }
    }
    return 0;
  };

  const generateTargetCode = (code) => {
    // Generate target assembly code based on intermediate code
    const ast = generateCppAST(code);
    const assembly = [];
    
    // Add data section for strings
    assembly.push('.section .data');
    assembly.push('.LC0:');
    assembly.push('  .string "Hello, World!"');
    assembly.push('');
    
    // Add text section for code
    assembly.push('.section .text');
    assembly.push('.globl main');
    assembly.push('');
    
    // Generate code for each function
    ast.body.forEach(node => {
      if (node.type === 'FunctionDeclaration') {
        assembly.push(`${node.name}:`);
        assembly.push('  pushq %rbp');
        assembly.push('  movq %rsp, %rbp');
        
        // Allocate space for local variables
        const localVars = node.body.filter(stmt => stmt.type === 'VariableDeclaration');
        if (localVars.length > 0) {
          assembly.push(`  subq $${localVars.length * 8}, %rsp`);
        }
        
        // Generate code for function body
        node.body.forEach(stmt => {
          if (stmt.type === 'ReturnStatement') {
            if (stmt.value === '0') {
              assembly.push('  movl $0, %eax');
            } else {
              assembly.push(`  movl $${stmt.value}, %eax`);
            }
          }
        });
        
        assembly.push('  leave');
        assembly.push('  ret');
        assembly.push('');
      }
    });
    
    return assembly.join('\n');
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // ... (rest of the component remains the same)
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code size={28} />
            <h1 className="text-2xl font-bold">C++ Compiler Frontend</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-800 px-3 py-2 rounded-md"
            >
              <Info size={16} />
              <span>About</span>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-md shadow-lg p-4 z-10">
                <h3 className="font-bold text-lg mb-2">C++ Compiler</h3>
                <p className="text-sm mb-2">A C++ compiler frontend with:</p>
                <ul className="text-xs space-y-1">
                  <li>• Lexical Analysis</li>
                  <li>• Syntax Analysis</li>
                  <li>• Semantic Analysis</li>
                  <li>• Intermediate Code Generation</li>
                  <li>• Target Code Generation</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Upload C++ File</h2>
            <div className="flex space-x-2">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                <Upload size={16} />
                <span>Select File</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".cpp,.cxx,.cc,.h,.hpp"
                  onChange={handleFileChange}
                />
              </label>
              <button
                onClick={handleCompile}
                disabled={!code || loading}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                  !code || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Play size={16} />
                <span>{loading ? 'Compiling...' : 'Compile'}</span>
              </button>
            </div>
          </div>

          {file && (
            <div className="flex items-center bg-blue-50 p-3 rounded-md mb-4">
              <CheckCircle className="text-green-600 mr-2" size={20} />
              <span className="text-blue-800 font-medium">{file.name}</span>
              <span className="text-gray-500 text-sm ml-2">
                ({Math.round(file.size / 1024)} KB)
              </span>
            </div>
          )}

          <div className="border rounded-md">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 ${
                  activeTab === 'code'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('code')}
              >
                Source Code
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'result'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('result')}
                disabled={!compileResult}
              >
                Compilation Results
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'code' ? (
                <textarea
                  className="w-full h-64 p-3 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your C++ code here or upload a file"
                />
              ) : (
                compileResult && (
                  <div>
                    <div className={`mb-4 p-3 rounded-md ${
                      compileResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        {compileResult.success ? (
                          <CheckCircle className="mr-2" size={20} />
                        ) : (
                          <AlertCircle className="mr-2" size={20} />
                        )}
                        <span className="font-medium">
                          {compileResult.success
                            ? 'Compilation successful!'
                            : 'Compilation failed!'}
                        </span>
                      </div>
                    </div>

                    {/* Accordion for detailed results */}
                    <div className="space-y-2">
                      {/* Errors & Warnings */}
                      <div className="border rounded-md overflow-hidden">
                        <button
                          className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleAccordion(0)}
                        >
                          <div className="flex items-center">
                            <AlertCircle size={18} className={compileResult.errors.length > 0 ? "text-red-600 mr-2" : "text-gray-400 mr-2"} />
                            <span className="font-medium">Errors & Warnings</span>
                            {compileResult.errors.length > 0 && (
                              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{compileResult.errors.length}</span>
                            )}
                          </div>
                          {activeAccordion === 0 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {activeAccordion === 0 && (
                          <div className="p-3 bg-white">
                            {compileResult.errors.length > 0 ? (
                              <ul className="space-y-2">
                                {compileResult.errors.map((error, index) => (
                                  <li key={index} className="flex items-start text-red-600">
                                    <span className="font-mono bg-red-50 px-2 py-1 rounded mr-2">
                                      Line {error.line}:
                                    </span>
                                    {error.message}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-green-600">No errors or warnings found.</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tokens */}
                      <div className="border rounded-md overflow-hidden">
                        <button
                          className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleAccordion(1)}
                        >
                          <div className="flex items-center">
                            <Book size={18} className="text-blue-600 mr-2" />
                            <span className="font-medium">Tokens</span>
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{compileResult.tokens.length}</span>
                          </div>
                          {activeAccordion === 1 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {activeAccordion === 1 && (
                          <div className="p-3 bg-white overflow-auto max-h-64">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {compileResult.tokens.slice(0, 20).map((token, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap font-mono text-sm">{token.value}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                                        token.type === 'keyword' ? 'bg-purple-100 text-purple-800' :
                                        token.type === 'operator' ? 'bg-red-100 text-red-800' :
                                        token.type === 'literal' ? 'bg-green-100 text-green-800' :
                                        token.type === 'preprocessor' ? 'bg-indigo-100 text-indigo-800' :
                                        token.type === 'punctuation' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {token.type}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{token.line}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {compileResult.tokens.length > 20 && (
                              <p className="text-center text-gray-500 mt-2 text-sm">
                                Showing 20 of {compileResult.tokens.length} tokens
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Abstract Syntax Tree */}
                      <div className="border rounded-md overflow-hidden">
                        <button
                          className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleAccordion(2)}
                        >
                          <div className="flex items-center">
                            <Server size={18} className="text-indigo-600 mr-2" />
                            <span className="font-medium">Abstract Syntax Tree</span>
                          </div>
                          {activeAccordion === 2 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {activeAccordion === 2 && (
                          <div className="p-3 bg-white">
                            <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs font-mono">
                              {JSON.stringify(compileResult.ast, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Semantic Analysis */}
                      <div className="border rounded-md overflow-hidden">
                        <button
                          className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleAccordion(3)}
                        >
                          <div className="flex items-center">
                            <Info size={18} className="text-blue-600 mr-2" />
                            <span className="font-medium">Semantic Analysis</span>
                          </div>
                          {activeAccordion === 3 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {activeAccordion === 3 && (
                          <div className="p-3 bg-white">
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Variables</h4>
                              {compileResult.semanticAnalysis.variables.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {compileResult.semanticAnalysis.variables.map((v, i) => (
                                      <tr key={i}>
                                        <td className="px-4 py-2">{v.name}</td>
                                        <td className="px-4 py-2">{v.type}</td>
                                        <td className="px-4 py-2">{v.line}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-gray-500">No variables declared</p>
                              )}
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Functions</h4>
                              {compileResult.semanticAnalysis.functions.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Type</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {compileResult.semanticAnalysis.functions.map((f, i) => (
                                      <tr key={i}>
                                        <td className="px-4 py-2">{f.name}</td>
                                        <td className="px-4 py-2">{f.returnType}</td>
                                        <td className="px-4 py-2">{f.line}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-gray-500">No functions declared</p>
                              )}
                            </div>
                            
                            {compileResult.semanticAnalysis.warnings.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Warnings</h4>
                                <ul className="space-y-1">
                                  {compileResult.semanticAnalysis.warnings.map((w, i) => (
                                    <li key={i} className="text-yellow-600">
                                      Line {w.line}: {w.message}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Intermediate Code */}
                      <div className="border rounded-md overflow-hidden">
                        <button
                          className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleAccordion(4)}
                        >
                          <div className="flex items-center">
                            <Code size={18} className="text-green-600 mr-2" />
                            <span className="font-medium">Intermediate Code</span>
                          </div>
                          {activeAccordion === 4 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {activeAccordion === 4 && (
                          <div className="p-3 bg-white">
                            <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs font-mono">
                              {compileResult.intermediateCode}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Target Code */}
                      <div className="border rounded-md overflow-hidden">
                        <button
                          className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleAccordion(5)}
                        >
                          <div className="flex items-center">
                            <Server size={18} className="text-purple-600 mr-2" />
                            <span className="font-medium">Target Code</span>
                          </div>
                          {activeAccordion === 5 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {activeAccordion === 5 && (
                          <div className="p-3 bg-white">
                            <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs font-mono">
                              {compileResult.targetCode}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

     <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About the C++ Compiler</h2>
          <p className="text-gray-600 mb-4">
            This C++ compiler frontend demonstrates the complete compilation process from source code to target assembly code.
            It includes all major phases of compilation with detailed outputs for each stage.
          </p>
          
          <h3 className="font-semibold text-lg text-gray-800 mb-2">Compilation Phases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start">
              <CheckCircle size={16} className="text-green-600 mr-2 mt-1" />
              <span>Lexical Analysis (Tokenization)</span>
            </div>
            <div className="flex items-start">
              <CheckCircle size={16} className="text-green-600 mr-2 mt-1" />
              <span>Syntax Analysis (AST Generation)</span>
            </div>
            <div className="flex items-start">
              <CheckCircle size={16} className="text-green-600 mr-2 mt-1" />
              <span>Semantic Analysis</span>
            </div>
            <div className="flex items-start">
              <CheckCircle size={16} className="text-green-600 mr-2 mt-1" />
              <span>Intermediate Code Generation</span>
            </div>
            <div className="flex items-start">
              <CheckCircle size={16} className="text-green-600 mr-2 mt-1" />
              <span>Target Code Generation</span>
            </div>
            <div className="flex items-start">
              <CheckCircle size={16} className="text-green-600 mr-2 mt-1" />
              <span>Error Handling</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-300 p-4 text-center">
        <p>© 2025 C++ Compiler Frontend | Demonstration Project</p>
      </footer>
    </div>
  );
}