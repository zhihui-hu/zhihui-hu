# 获取当前时间并格式化版本号
VERSION := $(shell node -e "\
  const d=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Shanghai'}));\
  const y=String(d.getFullYear()).slice(-2);\
  const m=d.getMonth()+1;\
  const day=d.getDate();\
  const h=String(d.getHours()).padStart(2,'0');\
  const mn=String(d.getMinutes()).padStart(2,'0');\
  process.stdout.write(y+'.'+m+day+'.'+h+mn);\
")
# 默认提交消息
DEFAULT_MSG := "bump version to v$(VERSION)"
POST_BANNER_COMMANDS := banner banner-prepare banner-generate banner-upload banner-inject banner-gemini img img-prepare img-generate img-upload img-inject img-gemini

ifeq ($(filter $(firstword $(MAKECMDGOALS)),$(POST_BANNER_COMMANDS)),$(firstword $(MAKECMDGOALS)))
POST_BANNER_GOAL_INPUT := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
.PHONY: $(POST_BANNER_GOAL_INPUT)
$(foreach goal,$(POST_BANNER_GOAL_INPUT),$(eval $(goal):;@:))
endif

POST_BANNER_INPUT_EXPR := $${POST_BANNER_INPUT:-$${FILE:-$${POST:-$${SLUG:-$(POST_BANNER_GOAL_INPUT)}}}}
POST_BANNER_PROVIDER_ARG := $(strip $(if $(PROVIDER),--provider $(PROVIDER)))
POST_BANNER_PATH_HINT := For non-ASCII paths, use: make $(firstword $(MAKECMDGOALS)) FILE='posts/article.md'


# 检查 npm 是否安装
NPM := $(shell command -v npm 2> /dev/null)
ifeq ($(strip $(NPM)),)
$(error npm is not installed. Please install Node.js and npm)
endif


# 更新版本号，增加错误处理
update-version:
	@if [ -f "package.json" ]; then \
		echo "Updating package.json version to $(VERSION)"; \
		node -e "const fs = require('fs'); \
			const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); \
			pkg.version = '$(VERSION)'; \
			fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" || \
		(echo "Failed to update package.json"; exit 1); \
	else \
		echo "package.json not found"; \
		exit 1; \
	fi

# 提交版本变更到Git
push-version: update-version
	@echo "Committing version change"
	@git diff --quiet package.json || \
		(git add . && \
		git commit -m "bump version to v$(VERSION)" && \
		git push) || \
		(echo "Git commit failed"; exit 1)

# 创建并推送标签
push-tag: push-version
	@echo "Creating and pushing tag v$(VERSION)"
	@git tag v$(VERSION) && \
		git push origin v$(VERSION) || \
		(echo "Failed to create and push tag"; exit 1)

# 开发环境
dev:
	@$(NPM) run dev

deploy:
	@$(NPM) run deploy

banner-prepare:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make banner-prepare <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh prepare "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

banner-generate:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make banner-generate <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh generate "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

banner-upload:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make banner-upload <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh upload "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

banner-inject:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make banner-inject <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh inject "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

banner:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make banner <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

banner-gemini:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make banner-gemini <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh "$$input_ref" --provider gemini $(ARGS)

img:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make img <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

img-prepare:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make img-prepare <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh prepare "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

img-generate:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make img-generate <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh generate "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

img-upload:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make img-upload <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh upload "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

img-inject:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make img-inject <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh inject "$$input_ref" $(POST_BANNER_PROVIDER_ARG) $(ARGS)

img-gemini:
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; test -n "$$input_ref" || (echo "Usage: make img-gemini <文章地址|slug|文章文件> [ARGS='...']"; echo "$(POST_BANNER_PATH_HINT)"; exit 1)
	@input_ref="$(POST_BANNER_INPUT_EXPR)"; bash scripts/post-banner.sh "$$input_ref" --provider gemini $(ARGS)
