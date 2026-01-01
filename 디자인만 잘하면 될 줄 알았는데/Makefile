.PHONY: all build build-cli build-server clean deps dev serve test help web

# Variables
GO=go
NPM=npm
CLI_DIR=cmd/cli
SERVER_DIR=cmd/server
WEB_DIR=web
BIN_DIR=bin

# Default target
all: build

# Build all
build: build-cli build-server
	@echo "✓ Build complete"

# Build CLI
build-cli:
	@echo "🔨 Building CLI..."
	@mkdir -p $(BIN_DIR)
	@$(GO) build -o $(BIN_DIR)/hanib ./$(CLI_DIR)
	@echo "✓ CLI: $(BIN_DIR)/hanib"

# Build server
build-server:
	@echo "🔨 Building server..."
	@mkdir -p $(BIN_DIR)
	@$(GO) build -o $(BIN_DIR)/hanib-server ./$(SERVER_DIR)
	@echo "✓ Server: $(BIN_DIR)/hanib-server"

# Build web
web:
	@echo "🔨 Building web..."
	@cd $(WEB_DIR) && $(NPM) run build
	@echo "✓ Web built"

# Install dependencies
deps:
	@echo "📥 Installing Go dependencies..."
	@$(GO) mod tidy
	@echo "📥 Installing web dependencies..."
	@cd $(WEB_DIR) && $(NPM) install
	@echo "✓ Dependencies installed"

# Development mode (run server and vite in parallel)
dev: build-server
	@echo "🚀 Starting development servers..."
	@trap 'kill 0' SIGINT; \
		(cd $(WEB_DIR) && $(NPM) run dev) & \
		./$(BIN_DIR)/hanib-server --port 3031 & \
		wait

# Run server only
serve: build-server
	@echo "🚀 Starting server..."
	@./$(BIN_DIR)/hanib-server

# Clean build artifacts
clean:
	@echo "🧹 Cleaning..."
	@rm -rf $(BIN_DIR)
	@rm -rf $(WEB_DIR)/dist
	@rm -rf $(WEB_DIR)/node_modules
	@echo "✓ Clean complete"

# Test
test:
	@echo "🧪 Running tests..."
	@$(GO) test ./...
	@echo "✓ Tests complete"

# Install CLI globally
install: build-cli
	@echo "📦 Installing CLI globally..."
	@sudo cp $(BIN_DIR)/hanib /usr/local/bin/hanib
	@echo "✓ Installed: /usr/local/bin/hanib"

# Uninstall CLI
uninstall:
	@echo "🗑️  Uninstalling CLI..."
	@sudo rm -f /usr/local/bin/hanib
	@echo "✓ Uninstalled"

# Help
help:
	@echo "Hanib - 콘텐츠 에디터"
	@echo ""
	@echo "Usage:"
	@echo "  make build       Build all (CLI + server)"
	@echo "  make build-cli   Build CLI only"
	@echo "  make build-server Build server only"
	@echo "  make web         Build web frontend"
	@echo "  make deps        Install dependencies"
	@echo "  make dev         Start development mode"
	@echo "  make serve       Start production server"
	@echo "  make clean       Clean build artifacts"
	@echo "  make test        Run tests"
	@echo "  make install     Install CLI globally"
	@echo "  make uninstall   Uninstall CLI"
	@echo "  make help        Show this help"
