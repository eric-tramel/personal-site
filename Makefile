# Jekyll Site Makefile
# 
# This Makefile provides convenient commands for building and serving
# your Jekyll website with multiple environment options.

# Variables
JEKYLL_VERSION = 3.8.5
SOURCE_DIR = src
BUILD_DIR = _site
CONFIG_PROD = _config.yml
CONFIG_DEV = _config.yml,_config-dev.yml

# Colors for pretty output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Help target - shows available commands
.PHONY: help
help: ## Show this help message
	@echo "$(GREEN)Jekyll Site Build Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Environment Options:$(NC)"
	@echo "  Use 'make <command>' for native bundle execution"
	@echo "  Use 'make <command>-docker' for Docker-based execution"

# Install dependencies
.PHONY: install
install: ## Install Ruby dependencies via Bundler
	@echo "$(GREEN)Installing Ruby dependencies...$(NC)"
	bundle install

.PHONY: install-docker
install-docker: ## Install dependencies via Docker (pulls Jekyll image)
	@echo "$(GREEN)Pulling Jekyll Docker image...$(NC)"
	docker pull jekyll/builder:$(JEKYLL_VERSION)

# Build commands
.PHONY: build
build: ## Build the site for production
	@echo "$(GREEN)Building site for production...$(NC)"
	bundle exec jekyll build --config $(CONFIG_PROD)
	@echo "$(GREEN)✓ Production build complete! Output in $(BUILD_DIR)/$(NC)"

.PHONY: build-dev
build-dev: ## Build the site for development
	@echo "$(GREEN)Building site for development...$(NC)"
	bundle exec jekyll build --config $(CONFIG_DEV)
	@echo "$(GREEN)✓ Development build complete! Output in $(BUILD_DIR)/$(NC)"

.PHONY: build-docker
build-docker: ## Build the site using Docker
	@echo "$(GREEN)Building site with Docker...$(NC)"
	docker run --rm --volume="$(PWD):/srv/jekyll" -it jekyll/builder:$(JEKYLL_VERSION) jekyll build --config $(CONFIG_PROD)
	@echo "$(GREEN)✓ Docker build complete! Output in $(BUILD_DIR)/$(NC)"

# Serve commands
.PHONY: serve
serve: ## Start local development server
	@echo "$(GREEN)Starting local development server...$(NC)"
	@echo "$(YELLOW)Site will be available at: http://localhost:4000$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop the server$(NC)"
	bundle exec jekyll serve --config $(CONFIG_DEV) --host 0.0.0.0 --port 4000

.PHONY: serve-docker
serve-docker: ## Start local development server using Docker
	@echo "$(GREEN)Starting local development server with Docker...$(NC)"
	@echo "$(YELLOW)Site will be available at: http://localhost:4000$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop the server$(NC)"
	docker run --rm --publish 35729:35729 --publish=4000:4000 --volume="$(PWD):/srv/jekyll" -it jekyll/builder:$(JEKYLL_VERSION) jekyll serve --config $(CONFIG_DEV)

.PHONY: serve-prod
serve-prod: ## Start local server with production config
	@echo "$(GREEN)Starting local server with production config...$(NC)"
	@echo "$(YELLOW)Site will be available at: http://localhost:4000$(NC)"
	bundle exec jekyll serve --config $(CONFIG_PROD) --host 0.0.0.0 --port 4000

# Development and testing commands
.PHONY: watch
watch: ## Watch for changes and rebuild automatically
	@echo "$(GREEN)Watching for changes...$(NC)"
	bundle exec jekyll build --config $(CONFIG_DEV) --watch

.PHONY: clean
clean: ## Clean the build directory
	@echo "$(GREEN)Cleaning build directory...$(NC)"
	bundle exec jekyll clean
	@echo "$(GREEN)✓ Build directory cleaned!$(NC)"

.PHONY: doctor
doctor: ## Run Jekyll doctor to check for issues
	@echo "$(GREEN)Running Jekyll doctor...$(NC)"
	bundle exec jekyll doctor

.PHONY: test
test: build ## Build and test the site
	@echo "$(GREEN)Testing the built site...$(NC)"
	bundle exec htmlproofer $(BUILD_DIR) --check-html --check-favicon --check-opengraph

# Git and deployment helpers
.PHONY: status
status: ## Show git status and site info
	@echo "$(GREEN)Git Status:$(NC)"
	git status --short
	@echo ""
	@echo "$(GREEN)Site Info:$(NC)"
	@echo "Source: $(SOURCE_DIR)/"
	@echo "Output: $(BUILD_DIR)/"
	@echo "Config: $(CONFIG_DEV)"

# Publishing commands
.PHONY: publish
publish: ## Build and publish to GitHub Pages
	@echo "$(GREEN)Building and publishing to GitHub Pages...$(NC)"
	@echo "$(YELLOW)This will build the site and push to eric-tramel.github.io$(NC)"
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || (echo "$(RED)Aborted.$(NC)" && exit 1)
	@$(MAKE) _publish

.PHONY: _publish
_publish: clean build
	@echo "$(GREEN)Preparing to publish...$(NC)"
	@if [ ! -d "$(BUILD_DIR)" ]; then \
		echo "$(RED)Error: Build directory $(BUILD_DIR) not found!$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Cloning GitHub Pages repository...$(NC)"
	@rm -rf /tmp/gh-pages-deploy
	@git clone git@github.com:eric-tramel/eric-tramel.github.io.git /tmp/gh-pages-deploy
	@echo "$(GREEN)Syncing built site to GitHub Pages repo...$(NC)"
	@rsync -av --delete --exclude='.git' $(BUILD_DIR)/ /tmp/gh-pages-deploy/
	@cd /tmp/gh-pages-deploy && \
		git add -A && \
		git diff --cached --quiet || ( \
			echo "$(GREEN)Committing changes...$(NC)" && \
			git commit -m "Site update from personal-site build on $$(date '+%Y-%m-%d %H:%M:%S')" && \
			echo "$(GREEN)Pushing to GitHub Pages...$(NC)" && \
			git push origin master \
		) || echo "$(YELLOW)No changes to publish$(NC)"
	@rm -rf /tmp/gh-pages-deploy
	@echo "$(GREEN)✓ Successfully published to https://eric-tramel.github.io$(NC)"

.PHONY: publish-force
publish-force: ## Force publish without confirmation prompt
	@echo "$(GREEN)Force publishing to GitHub Pages...$(NC)"
	@$(MAKE) _publish

.PHONY: preview-publish
preview-publish: ## Show what would be published (dry run)
	@echo "$(GREEN)Preview of what would be published:$(NC)"
	@$(MAKE) clean build
	@echo "$(YELLOW)Files that would be published:$(NC)"
	@find $(BUILD_DIR) -type f | head -20
	@echo "$(YELLOW)... and $$(find $(BUILD_DIR) -type f | wc -l | tr -d ' ') total files$(NC)"
	@echo ""
	@echo "$(YELLOW)To actually publish, run: make publish$(NC)"

# Quick development workflow
.PHONY: dev
dev: clean install build-dev serve ## Complete development setup: clean, install, build, serve

# Production workflow  
.PHONY: prod
prod: clean install build ## Complete production build: clean, install, build

# Update dependencies
.PHONY: update
update: ## Update Ruby dependencies
	@echo "$(GREEN)Updating Ruby dependencies...$(NC)"
	bundle update

.PHONY: outdated
outdated: ## Check for outdated dependencies
	@echo "$(GREEN)Checking for outdated dependencies...$(NC)"
	bundle outdated

# Utility commands
.PHONY: version
version: ## Show Jekyll and Ruby versions
	@echo "$(GREEN)Version Information:$(NC)"
	@echo "Ruby: $$(ruby --version)"
	@echo "Bundler: $$(bundle --version)"
	@echo "Jekyll: $$(bundle exec jekyll --version)"

# Stop any running Jekyll servers
.PHONY: stop
stop: ## Stop any running Jekyll servers
	@echo "$(GREEN)Stopping Jekyll servers...$(NC)"
	@pkill -f "jekyll serve" || echo "No Jekyll servers running"
	@echo "$(GREEN)✓ Stopped Jekyll servers$(NC)"

# Create new post helper
.PHONY: post
post: ## Create a new blog post (usage: make post TITLE="Post Title")
ifndef TITLE
	@echo "$(RED)Error: Please provide a TITLE$(NC)"
	@echo "Usage: make post TITLE=\"My New Post\""
else
	@echo "$(GREEN)Creating new post: $(TITLE)$(NC)"
	@DATE=$$(date +%Y-%m-%d); \
	SLUG=$$(echo "$(TITLE)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$$//g'); \
	FILE="$(SOURCE_DIR)/_posts/blog/$$DATE-$$SLUG.markdown"; \
	echo "---" > "$$FILE"; \
	echo "title: \"$(TITLE)\"" >> "$$FILE"; \
	echo "layout: post" >> "$$FILE"; \
	echo "date: $$DATE" >> "$$FILE"; \
	echo "category: blog" >> "$$FILE"; \
	echo "tag:" >> "$$FILE"; \
	echo "- blog" >> "$$FILE"; \
	echo "---" >> "$$FILE"; \
	echo "" >> "$$FILE"; \
	echo "Your post content goes here." >> "$$FILE"; \
	echo "$(GREEN)✓ Created: $$FILE$(NC)"
endif

# Python environment for publications management
.PHONY: scholar-setup
scholar-setup: ## Setup Python environment with uv for scholarly library
	@echo "$(GREEN)Setting up Python environment for scholarly...$(NC)"
	@if ! command -v uv >/dev/null 2>&1; then \
		echo "$(RED)Error: uv not found. Please install uv first.$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Creating virtual environment...$(NC)"
	@uv venv .venv --python 3.11
	@echo "$(YELLOW)Installing scholarly library...$(NC)"
	@uv pip install scholarly
	@echo "$(GREEN)✓ Python environment ready in .venv/$(NC)"
	@echo "$(YELLOW)Use 'make scholar-sync' to fetch publications$(NC)"

.PHONY: scholar-sync
scholar-sync: ## Sync all publications from Google Scholar
	@echo "$(GREEN)Syncing all publications from Google Scholar...$(NC)"
	@if [ ! -d ".venv" ]; then \
		echo "$(YELLOW)Setting up Python environment first...$(NC)"; \
		$(MAKE) scholar-setup; \
	fi
	@mkdir -p scripts
	@.venv/bin/python scripts/sync_publications.py
	@echo "$(GREEN)✓ Publications sync complete$(NC)"

.PHONY: scholar-update
scholar-update: ## Update publications from Google Scholar (sync + compare + add new)
	@echo "$(GREEN)Updating publications from Google Scholar...$(NC)"
	@$(MAKE) scholar-sync
	@echo "$(YELLOW)Comparing with existing publications...$(NC)"
	@.venv/bin/python scripts/update_publications.py
	@echo "$(GREEN)✓ Publications update complete$(NC)"

.PHONY: scholar-test
scholar-test: ## Test scholarly library connection
	@echo "$(GREEN)Testing scholarly library...$(NC)"
	@if [ ! -d ".venv" ]; then \
		echo "$(YELLOW)Setting up Python environment first...$(NC)"; \
		$(MAKE) scholar-setup; \
	fi
	@.venv/bin/python -c "from scholarly import scholarly; print('Scholarly library working!'); print('Testing with search...'); search = scholarly.search_pubs('machine learning'); pub = next(search); print(f'Found test publication: {pub.get(\"bib\", {}).get(\"title\", \"No title\")}')"
	@echo "$(GREEN)✓ Scholarly library test passed$(NC)"