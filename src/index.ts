import { dirname, resolve } from "node:path";
import * as ts from "typescript";

/**
 * Recursively check if a type or any of its base types is (or implements) DurableObject
 */
function isOrExtendsDurableObject(
  type: ts.Type,
  typeChecker: ts.TypeChecker,
  visited = new Set<ts.Type>()
): boolean {
  if (visited.has(type)) return false;
  visited.add(type);

  const typeName = type.symbol?.getName();

  // Check if this type is DurableObject
  if (typeName === "DurableObject") {
    return true;
  }

  // Check all base types (extends)
  const baseTypes = type.getBaseTypes?.() || [];
  for (const baseType of baseTypes) {
    if (isOrExtendsDurableObject(baseType, typeChecker, visited)) {
      return true;
    }
  }

  // If getBaseTypes() didn't work, try to manually check the heritage clauses
  const symbol = type.getSymbol?.();
  if (symbol) {
    const declarations = symbol.getDeclarations?.() || [];
    for (const decl of declarations) {
      if (ts.isClassDeclaration(decl) && decl.heritageClauses) {
        for (const heritage of decl.heritageClauses) {
          if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {
            for (const typeRef of heritage.types) {
              const baseTypeName = typeRef.expression.getText();

              // Try to get the type and check recursively
              const baseType = typeChecker.getTypeAtLocation(
                typeRef.expression
              );
              if (
                baseType &&
                isOrExtendsDurableObject(baseType, typeChecker, visited)
              ) {
                return true;
              }
            }
          }
          if (heritage.token === ts.SyntaxKind.ImplementsKeyword) {
            for (const typeRef of heritage.types) {
              const implementedType = typeChecker.getTypeAtLocation(typeRef);
              if (
                isOrExtendsDurableObject(implementedType, typeChecker, visited)
              ) {
                return true;
              }
            }
          }
        }
      }
    }
  }

  return false;
}

/**
 * Check if a class extends or implements DurableObject
 */
function isDurableObjectClass(
  classDeclaration: ts.ClassDeclaration,
  typeChecker: ts.TypeChecker
): boolean {
  const className = classDeclaration.name?.text;
  if (!className) return false;

  // Get the type of the class
  const classType = typeChecker.getTypeAtLocation(classDeclaration);
  if (!classType) return false;

  return isOrExtendsDurableObject(classType, typeChecker);
}

/**
 * Analyze a TypeScript file to find DurableObject classes
 */
function analyzeFile(filePath: string): string[] {
  try {
    // Find and parse the nearest tsconfig.json
    const configPath = ts.findConfigFile(
      dirname(resolve(filePath)),
      ts.sys.fileExists,
      "tsconfig.json"
    );
    if (!configPath) {
      throw new Error("Could not find a valid 'tsconfig.json'.");
    }
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    if (configFile.error) {
      throw new Error(
        ts.formatDiagnosticsWithColorAndContext([configFile.error], {
          getCurrentDirectory: ts.sys.getCurrentDirectory,
          getCanonicalFileName: (f) => f,
          getNewLine: () => "\n",
        })
      );
    }
    const configParseResult = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      dirname(configPath),
      undefined,
      configPath
    );
    if (configParseResult.errors.length > 0) {
      throw new Error(
        ts.formatDiagnosticsWithColorAndContext(configParseResult.errors, {
          getCurrentDirectory: ts.sys.getCurrentDirectory,
          getCanonicalFileName: (f) => f,
          getNewLine: () => "\n",
        })
      );
    }

    // Add the input file if not already present
    if (!configParseResult.fileNames.includes(resolve(filePath))) {
      configParseResult.fileNames.push(resolve(filePath));
    }

    const program = ts.createProgram(
      configParseResult.fileNames,
      configParseResult.options
    );
    const typeChecker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(resolve(filePath));

    if (!sourceFile) {
      throw new Error(`Could not parse source file: ${filePath}`);
    }

    const durableObjectClasses: string[] = [];

    // Visit all nodes in the source file
    function visitNode(
      node: ts.Node,
      typeChecker: ts.TypeChecker,
      durableObjectClasses: string[]
    ) {
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.text;
        // Check if the class is exported
        const isExported = node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        );
        if (isExported) {
          // Check if it extends or implements DurableObject
          const isDurableObject = isDurableObjectClass(node, typeChecker);
          if (isDurableObject) {
            durableObjectClasses.push(className);
          }
        }
      }
      ts.forEachChild(node, (child) =>
        visitNode(child, typeChecker, durableObjectClasses)
      );
    }

    visitNode(sourceFile, typeChecker, durableObjectClasses);
    return durableObjectClasses;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error("Usage: bun src/index.ts <input-file>");
    process.exit(1);
  }

  const inputFile = args[0];

  try {
    const durableObjectClasses = analyzeFile(inputFile);
    console.log(JSON.stringify(durableObjectClasses));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the main function
main();
