# Vite Plugin for Inferring Durable Object Bindings

## Overview

Create a Vite plugin that automatically infers Durable Object classes from TypeScript files and updates `wrangler.jsonc` configuration files with the appropriate bindings.

## Plan of Action

### Phase 1: Core Infrastructure

- [ ] **Set up plugin structure**

  - [ ] Create basic Vite plugin skeleton in `src/vite-plugin.ts`
  - [ ] Define plugin options interface
  - [ ] Set up plugin lifecycle hooks (buildStart, transform, closeBundle)

- [x] **Create TypeScript AST parser** ✅ **COMPLETED**
  - [x] Use TypeScript compiler API to parse source files
  - [x] Identify Durable Object class definitions
  - [x] Extract class names and metadata
  - [x] Handle imports and exports

### Phase 2: Durable Object Detection ✅ **COMPLETED**

All Durable Object detection functionality is implemented in `src/index.ts` via the `getDurableObjectClassNames` function.

### Phase 3: Wrangler Configuration Management

- [ ] **Parse existing wrangler.jsonc**

  - [ ] Read and parse JSONC files
  - [ ] Preserve existing configuration
  - [ ] Handle comments and formatting
  - [ ] Validate JSONC structure

- [ ] **Generate durable_object_bindings**

  - [ ] Create binding entries for each detected Durable Object
  - [ ] Format: `{ "name": "ClassName", "class_name": "ClassName" }` (class name = binding name)
  - [ ] Merge with existing bindings (avoid duplicates)
  - [ ] Preserve existing binding order and formatting

- [ ] **Write updated configuration**
  - [ ] Update `wrangler.jsonc` with new bindings
  - [ ] Preserve file formatting and comments
  - [ ] Handle backup/rollback scenarios
  - [ ] Provide user feedback on changes

### Phase 4: Plugin Integration

- [ ] **Vite plugin hooks**

  - [ ] `buildStart`: Scan for Durable Objects and update wrangler.jsonc
  - [ ] `transform`: Optionally transform files during build
  - [ ] `closeBundle`: Final validation and cleanup
  - [ ] Handle watch mode for development

- [ ] **Configuration options**
  - [ ] `wranglerConfigPath`: Path to wrangler.jsonc file
  - [ ] `autoUpdate`: Whether to automatically update wrangler.jsonc
  - [ ] `backup`: Whether to create backup before modifications
  - [ ] `verbose`: Enable detailed logging

### Phase 5: Error Handling & Validation

- [ ] **Input validation**

  - [ ] Validate TypeScript file existence and syntax
  - [ ] Check wrangler.jsonc file permissions
  - [ ] Validate plugin configuration options
  - [ ] Handle malformed JSONC files

- [ ] **Error recovery**
  - [ ] Graceful handling of parsing errors
  - [ ] Rollback changes on critical errors
  - [ ] Provide helpful error messages
  - [ ] Log warnings for potential issues

### Phase 6: Testing & Documentation

- [ ] **Create test fixtures**

  - [ ] Sample TypeScript files with Durable Objects
  - [ ] Various import/export patterns
  - [ ] Edge cases and error scenarios
  - [ ] Expected wrangler.jsonc outputs

- [ ] **Write tests**

  - [ ] Unit tests for AST parsing
  - [ ] Integration tests for plugin functionality
  - [ ] Error handling tests
  - [ ] Performance tests for large codebases

- [ ] **Documentation**
  - [ ] Plugin usage examples
  - [ ] Configuration options reference
  - [ ] Troubleshooting guide
  - [ ] Migration guide for existing projects

### Phase 7: Advanced Features

- [ ] **Enhanced detection** (Future enhancements)

  - [ ] Support for abstract classes and interfaces
  - [ ] Detect Durable Objects in dependencies
  - [ ] Handle barrel exports and re-exports
  - [ ] Support for TypeScript path mapping
  - [ ] Support custom binding name annotations (e.g., `@binding("custom-name")`)

- [ ] **Performance optimizations**

  - [ ] Incremental scanning (only changed files)
  - [ ] Caching of parsed ASTs
  - [ ] Parallel processing for large codebases
  - [ ] Memory usage optimization

- [ ] **Developer experience**
  - [ ] CLI tool for standalone usage
  - [ ] VS Code extension integration
  - [ ] Interactive mode for manual review
  - [ ] Dry-run mode for previewing changes

## Implementation Order

1. ✅ **COMPLETED**: TypeScript AST parsing and Durable Object detection (`getDurableObjectClassNames` in `src/index.ts`)
2. Create basic Vite plugin structure in `src/vite-plugin.ts`
3. Add wrangler.jsonc reading/writing capabilities
4. Integrate into Vite plugin lifecycle
5. Add error handling and validation
6. Create tests and documentation
7. Add advanced features and optimizations

## Success Criteria

- [x] Plugin correctly identifies Durable Object classes in TypeScript files ✅ **COMPLETED**
- [ ] Automatically updates wrangler.jsonc with proper binding configuration
- [ ] Preserves existing configuration and formatting
- [ ] Provides clear error messages and validation
- [ ] Works seamlessly with Vite build process
- [ ] Comprehensive test coverage
- [ ] Well-documented and easy to use
