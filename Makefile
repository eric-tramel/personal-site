# Astro Site Makefile
#
# Build, develop, and publish workflow for the personal site.
# Deploy target: eric-tramel.github.io (master branch via deploy/ submodule)

# Variables
BLOG_DIR = src/content/blog
DEPLOY_DIR = deploy
DIST_DIR = dist
SITE_URL = https://eric-tramel.github.io

# Colors for pretty output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

.PHONY: help dev build clean publish publish-force preview-publish post

# Help target - shows available commands
help: ## Show this help message
	@echo "$(GREEN)Astro Site Build Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

dev: ## Start local development server
	@echo "$(GREEN)Starting development server...$(NC)"
	npm run dev

build: ## Build the site for production
	@echo "$(GREEN)Building site for production...$(NC)"
	npm run build
	@echo "$(GREEN)Done! Output in $(DIST_DIR)/$(NC)"

clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	rm -rf $(DIST_DIR) .astro
	@echo "$(GREEN)Done!$(NC)"

publish: ## Build and publish to GitHub Pages (with confirmation)
	@echo "$(GREEN)Building and publishing to GitHub Pages...$(NC)"
	@echo "$(YELLOW)This will build the site and push to $(SITE_URL)$(NC)"
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || (echo "$(RED)Aborted.$(NC)" && exit 1)
	@$(MAKE) _publish

publish-force: ## Build and publish without confirmation prompt
	@echo "$(GREEN)Force publishing to GitHub Pages...$(NC)"
	@$(MAKE) _publish

_publish: build
	@echo "$(GREEN)Syncing build to deploy directory...$(NC)"
	@rsync -av --delete --exclude='.git' $(DIST_DIR)/ $(DEPLOY_DIR)/
	@cd $(DEPLOY_DIR) && \
		git add -A && \
		if git diff --cached --quiet; then \
			echo "$(YELLOW)No changes to publish.$(NC)"; \
		else \
			echo "$(GREEN)Committing changes...$(NC)" && \
			git commit -m "Site update $$(date '+%Y-%m-%d %H:%M:%S')" && \
			echo "$(GREEN)Pushing to GitHub Pages...$(NC)" && \
			git push origin master && \
			echo "$(GREEN)Done! Published to $(SITE_URL)$(NC)"; \
		fi

preview-publish: ## Preview what would change in a publish (dry run)
	@echo "$(GREEN)Building site for publish preview...$(NC)"
	@npm run build
	@echo ""
	@echo "$(YELLOW)Changes that would be synced to deploy/:$(NC)"
	@rsync -avn --delete --exclude='.git' $(DIST_DIR)/ $(DEPLOY_DIR)/
	@echo ""
	@echo "$(YELLOW)To actually publish, run: make publish$(NC)"

post: ## Create a new blog post (usage: make post TITLE="Post Title")
ifndef TITLE
	@echo "$(RED)Error: Please provide a TITLE$(NC)"
	@echo "Usage: make post TITLE=\"My New Post\""
else
	@echo "$(GREEN)Creating new post: $(TITLE)$(NC)"
	@DATE=$$(date +%Y-%m-%d); \
	SLUG=$$(echo "$(TITLE)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$$//g'); \
	FILE="$(BLOG_DIR)/$$DATE-$$SLUG.md"; \
	echo "---" > "$$FILE"; \
	echo "title: \"$(TITLE)\"" >> "$$FILE"; \
	echo "description: \"\"" >> "$$FILE"; \
	echo "pubDate: \"$$DATE\"" >> "$$FILE"; \
	echo "tags: []" >> "$$FILE"; \
	echo "---" >> "$$FILE"; \
	echo "" >> "$$FILE"; \
	echo "Your post content goes here." >> "$$FILE"; \
	echo "$(GREEN)Done! Created: $$FILE$(NC)"
endif
