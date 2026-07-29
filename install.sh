#!/bin/bash

# Modern Theme 2026 - Installation Script
# Usage: ./install.sh /path/to/humhub
# Copies the theme module to HumHub modules directory and clears cache

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                              ║"
    echo "║               MODERN THEME 2026 - AUTOMATED INSTALLATION                    ║"
    echo "║                                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo ""
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_step() {
    echo -e "${BLUE}→ $1${NC}"
}

print_usage() {
    echo "Usage: $0 [--compile-css|--skip-compile-css] /path/to/humhub"
    echo ""
    echo "Options:"
    echo "  --compile-css      Force CSS compilation after copy"
    echo "  --skip-compile-css Skip CSS compilation"
    echo ""
    echo "Default behavior: auto-compile only when SCSS is newer than dist/theme.css"
}

run_as_humhub_user() {
    if [ "$WWW_USER" = "www-data" ]; then
        sudo -u www-data "$@"
    else
        "$@"
    fi
}

# Detect the actual module directory name (case-insensitive for flexibility)
detect_module_dir() {
    local base_dir="$1"
    
    # Try exact match first
    if [ -d "$base_dir/modern-theme-2026" ]; then
        echo "modern-theme-2026"
        return 0
    fi
    
    # Try case-insensitive matches (common when extracting from zip on case-insensitive FS)
    if [ -d "$base_dir/Modern-Theme-2026" ]; then
        print_warning "Found 'Modern-Theme-2026' (with capital M) - will be renamed to 'modern-theme-2026'"
        echo "Modern-Theme-2026"
        return 0
    fi
    
    if [ -d "$base_dir/MODERN-THEME-2026" ]; then
        print_warning "Found 'MODERN-THEME-2026' (uppercase) - will be renamed to 'modern-theme-2026'"
        echo "MODERN-THEME-2026"
        return 0
    fi
    
    # Directory not found in any casing
    return 1
}

# Parse arguments
COMPILE_MODE="auto"
HUMHUB_PATH=""

while [ $# -gt 0 ]; do
    case "$1" in
        --compile-css)
            COMPILE_MODE="force"
            ;;
        --skip-compile-css)
            COMPILE_MODE="skip"
            ;;
        -h|--help)
            print_header
            print_usage
            exit 0
            ;;
        -* )
            print_header
            print_error "Unknown option: $1"
            echo ""
            print_usage
            exit 1
            ;;
        *)
            if [ -n "$HUMHUB_PATH" ]; then
                print_header
                print_error "Too many arguments"
                echo ""
                print_usage
                exit 1
            fi
            HUMHUB_PATH="$1"
            ;;
    esac
    shift
done

# Validate required path argument
if [ -z "$HUMHUB_PATH" ]; then
    print_header
    print_error "Missing HumHub installation directory"
    echo ""
    print_usage
    echo ""
    echo "Example:"
    echo "  $0 /var/www/humhub"
    echo ""
    exit 1
fi

HUMHUB_PROTECTED="$HUMHUB_PATH/protected"
MODULES_DIR="$HUMHUB_PROTECTED/modules"
MODULE_NAME="modern-theme-2026"
MODULE_SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Validate source directory exists and contains module.json
if [ ! -f "$MODULE_SOURCE/module.json" ]; then
    print_header
    print_error "module.json not found at: $MODULE_SOURCE/module.json"
    echo ""
    echo "This script must be run from the Modern Theme 2026 module directory."
    echo "It cannot be executed from a different location."
    exit 1
fi

MODULE_DEST="$MODULES_DIR/$MODULE_NAME"

print_header

# Verify this script is being run from the module directory
print_step "Verifying module source..."
if [ ! -f "$MODULE_SOURCE/module.json" ]; then
    print_error "module.json not found at: $MODULE_SOURCE/module.json"
    echo ""
    echo "This script must be run from the Modern Theme 2026 module directory."
    echo "Try extracting the zip file and running: cd modern-theme-2026 && ./install.sh /path/to/humhub"
    exit 1
fi

# Get module version for informational purposes
MODULE_VERSION=$(grep -o '"version"[^,]*' "$MODULE_SOURCE/module.json" | cut -d'"' -f4)
print_info "Module version: $MODULE_VERSION"
echo ""

# Validate HumHub installation
print_step "Validating HumHub installation..."
if [ ! -d "$HUMHUB_PROTECTED" ]; then
    print_error "HumHub protected directory not found: $HUMHUB_PROTECTED"
    exit 1
fi
print_success "HumHub installation found at: $HUMHUB_PATH"

# Validate modules directory
if [ ! -d "$MODULES_DIR" ]; then
    print_error "HumHub modules directory not found: $MODULES_DIR"
    exit 1
fi
print_success "Modules directory found at: $MODULES_DIR"

# Check if module already exists
print_step "Checking for existing installation..."

# Detect any existing module installation (case-insensitive)
FOUND_EXISTING=$(find "$MODULES_DIR" -maxdepth 1 -type d -iname "*modern*theme*2026*" 2>/dev/null | head -1)

if [ -n "$FOUND_EXISTING" ]; then
    FOUND_NAME=$(basename "$FOUND_EXISTING")
    print_warning "Found existing module: $FOUND_NAME"
    
    # If it's not the correct casing, offer to fix it
    if [ "$FOUND_NAME" != "$MODULE_NAME" ]; then
        print_info "Will be renamed from '$FOUND_NAME' to '$MODULE_NAME' (correct casing)"
    fi
    
    read -p "Do you want to replace it? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installation cancelled"
        exit 0
    fi
    print_step "Removing existing module..."
    rm -rf "$FOUND_EXISTING"
fi

# Copy module
print_step "Copying module to HumHub..."
cp -r "$MODULE_SOURCE" "$MODULE_DEST"
print_success "Module copied to: $MODULE_DEST"

# Check for www-data user
if id -u www-data >/dev/null 2>&1; then
    WWW_USER="www-data"
else
    print_warning "www-data user not found, attempting to set permissions for current user only"
    WWW_USER="$(whoami)"
fi

# Set permissions
print_step "Setting permissions..."
chown -R "$WWW_USER:$WWW_USER" "$MODULE_DEST" 2>/dev/null || print_warning "Could not set ownership (try running with sudo)"
chmod -R 755 "$MODULE_DEST"
print_success "Permissions set"

# Optional CSS compilation (auto by default when SCSS changed)
DIST_CSS="$MODULE_DEST/themes/ModernTheme2026/dist/theme.css"
SCSS_ROOT="$MODULE_DEST/themes/ModernTheme2026/scss"
NEEDS_COMPILE="false"

if [ "$COMPILE_MODE" = "force" ]; then
    NEEDS_COMPILE="true"
elif [ "$COMPILE_MODE" = "auto" ]; then
    if [ ! -f "$DIST_CSS" ]; then
        NEEDS_COMPILE="true"
    elif [ -d "$SCSS_ROOT" ] && find "$SCSS_ROOT" -type f -name "*.scss" -newer "$DIST_CSS" -print -quit | grep -q .; then
        NEEDS_COMPILE="true"
    fi
fi

if [ "$COMPILE_MODE" = "skip" ]; then
    print_info "Skipping CSS compile (--skip-compile-css provided)"
elif [ "$NEEDS_COMPILE" = "true" ]; then
    print_step "Compiling theme CSS..."
    cd "$MODULE_DEST"
    if run_as_humhub_user php compile-css.php >/dev/null 2>&1; then
        print_success "Theme CSS compiled"
    else
        print_warning "CSS compile failed; continuing with existing dist/theme.css"
    fi
else
    print_info "Skipping CSS compile (dist/theme.css is up to date)"
fi

# Clear caches
print_step "Clearing HumHub cache..."
cd "$HUMHUB_PROTECTED"
run_as_humhub_user php yii cache/flush-all >/dev/null 2>&1 || print_warning "Could not run cache flush"
print_success "Cache flushed"

# Remove old published assets
print_step "Clearing published assets..."
ASSETS_DIR="$HUMHUB_PATH/assets"
if [ -d "$ASSETS_DIR" ]; then
    find "$ASSETS_DIR" -maxdepth 1 -type d \( -name "*modern*theme*" -o -name "*mt2026*" \) -print0 2>/dev/null | xargs -0 rm -rf 2>/dev/null || true
    print_success "Old assets cleared"
else
    print_warning "Assets directory not found"
fi

# Display theme info
print_step "Checking theme status..."
echo ""
cd "$HUMHUB_PROTECTED"
THEME_INFO=$(run_as_humhub_user php yii theme/info 2>/dev/null || echo "Could not retrieve theme info")
echo "$THEME_INFO"
echo ""

# Installation complete
print_header
print_success "Modern Theme 2026 installation complete!"
echo ""
print_info "Next steps:"
echo "  1. Log in to HumHub as administrator"
echo "  2. Go to Administration → Design → Theme"
echo "  3. Select 'Modern Theme 2026' and save"
echo "  4. Clear your browser cache"
echo ""
print_info "For more information, see the README.md in the module directory"
echo ""
