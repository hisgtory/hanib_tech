.PHONY: build clean install uninstall link unlink test help

BINARY_NAME=hanib
BUILD_DIR=.
INSTALL_DIR=/usr/local/bin
GO=go

# 기본 타겟
all: build

# 빌드
build:
	@echo "🔨 Building $(BINARY_NAME)..."
	@$(GO) build -o $(BUILD_DIR)/$(BINARY_NAME) .
	@echo "✓ Build complete: $(BUILD_DIR)/$(BINARY_NAME)"

# 클린
clean:
	@echo "🧹 Cleaning..."
	@rm -f $(BUILD_DIR)/$(BINARY_NAME)
	@echo "✓ Clean complete"

# 전역 설치 (복사)
install: build
	@echo "📦 Installing to $(INSTALL_DIR)..."
	@sudo cp $(BUILD_DIR)/$(BINARY_NAME) $(INSTALL_DIR)/$(BINARY_NAME)
	@echo "✓ Installed: $(INSTALL_DIR)/$(BINARY_NAME)"

# 전역 제거
uninstall:
	@echo "🗑️  Uninstalling..."
	@sudo rm -f $(INSTALL_DIR)/$(BINARY_NAME)
	@echo "✓ Uninstalled"

# 심볼릭 링크 (개발용)
link: build
	@echo "🔗 Creating symlink..."
	@sudo ln -sf $(CURDIR)/$(BINARY_NAME) $(INSTALL_DIR)/$(BINARY_NAME)
	@echo "✓ Linked: $(INSTALL_DIR)/$(BINARY_NAME) -> $(CURDIR)/$(BINARY_NAME)"

# 심볼릭 링크 제거
unlink:
	@echo "🔗 Removing symlink..."
	@sudo rm -f $(INSTALL_DIR)/$(BINARY_NAME)
	@echo "✓ Unlinked"

# 테스트 실행
test: build
	@echo "🧪 Running tests..."
	@echo ""
	@echo "=== hanib list ==="
	@cd ../.. && ./tools/hanib-cli/$(BINARY_NAME) list
	@echo ""
	@echo "✓ Tests complete"

# 의존성 설치
deps:
	@echo "📥 Installing dependencies..."
	@$(GO) mod tidy
	@echo "✓ Dependencies installed"

# 도움말
help:
	@echo "hanib-cli Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make build     빌드"
	@echo "  make clean     빌드 결과물 삭제"
	@echo "  make install   전역 설치 (/usr/local/bin에 복사)"
	@echo "  make uninstall 전역 제거"
	@echo "  make link      심볼릭 링크 생성 (개발용)"
	@echo "  make unlink    심볼릭 링크 제거"
	@echo "  make test      테스트 실행"
	@echo "  make deps      의존성 설치"
	@echo "  make help      이 도움말"
