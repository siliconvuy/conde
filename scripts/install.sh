#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Variables
CONDE_DIR="$HOME/.conde"
BIN_DIR="$CONDE_DIR/bin"
ENVS_DIR="$CONDE_DIR/envs"
PACKAGES_DIR="$CONDE_DIR/packages"
PKGINFO_DIR="$CONDE_DIR/pkginfo"
SCRIPTS_DIR="$CONDE_DIR/scripts"
LIB_DIR="$CONDE_DIR/lib"
DEFAULT_NODE_VERSION="18.14.0"

# Functions for logging
echo_info() {
  echo -e "\033[1;34m[Conde]\033[0m $1"
}

echo_error() {
  echo -e "\033[1;31m[Conde ERROR]\033[0m $1" >&2
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Create necessary directories
echo_info "Creating necessary directories at $CONDE_DIR..."
mkdir -p "$BIN_DIR" "$ENVS_DIR" "$PACKAGES_DIR" "$PKGINFO_DIR" "$SCRIPTS_DIR" "$LIB_DIR/node_modules"

# Copy Conde files
echo_info "Installing Conde files..."

# Copy bin directory
cp "$PROJECT_ROOT/bin/conde.js" "$BIN_DIR/"
chmod +x "$BIN_DIR/conde.js"

# Copy lib directory
cp -r "$PROJECT_ROOT/lib/"* "$LIB_DIR/"

# Copy shell integration script
cp "$PROJECT_ROOT/scripts/conde.sh" "$SCRIPTS_DIR/"
chmod +x "$SCRIPTS_DIR/conde.sh"

# Download and install Node.js
NODE_VERSION="${DEFAULT_NODE_VERSION}"
OS="$(uname | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

# Adjust architecture naming
if [ "$ARCH" == "x86_64" ]; then
  ARCH="x64"
elif [[ "$ARCH" == arm* ]]; then
  ARCH="arm64"
else
  echo_error "Unsupported architecture: $ARCH"
  exit 1
fi

NODE_TARBALL="node-v${NODE_VERSION}-${OS}-${ARCH}.tar.xz"
NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TARBALL}"

echo_info "Downloading Node.js from $NODE_URL..."
curl -L -o "/tmp/$NODE_TARBALL" "$NODE_URL"

if [ ! -f "/tmp/$NODE_TARBALL" ]; then
    echo_error "Failed to download Node.js. Check the URL and your internet connection."
    exit 1
fi

echo_info "Extracting Node.js..."
tar -xf "/tmp/$NODE_TARBALL" -C "/tmp"

echo_info "Installing Node.js to $BIN_DIR..."
cp -r "/tmp/node-v${NODE_VERSION}-${OS}-${ARCH}/"* "$BIN_DIR/"

# Clean up temporary files
rm -rf "/tmp/$NODE_TARBALL" "/tmp/node-v${NODE_VERSION}-${OS}-${ARCH}"

# Install dependencies
echo_info "Installing dependencies..."
cd "$CONDE_DIR"
cp "$PROJECT_ROOT/package.json" .

# Install dependencies directly without running scripts
npm install --production --no-scripts

# Create version file
echo "$DEFAULT_NODE_VERSION" > "$CONDE_DIR/version"
echo_info "Initialized Conde version file"

# Add shell integration instructions
echo_info "\nTo complete installation, add this to your ~/.bashrc or ~/.zshrc:"
echo -e "\n# Conde initialization"
echo "source ~/.conde/scripts/conde.sh"
echo -e "\nThen restart your shell or run: source ~/.bashrc (or ~/.zshrc for Zsh)\n"

# Verify script integrity
SCRIPT_HASH=$(sha256sum "$0" | cut -d' ' -f1)
EXPECTED_HASH=$(curl -fsSL "$RELEASES_URL" | jq -r '.releases[-1].hash')

if [ "$SCRIPT_HASH" != "$EXPECTED_HASH" ]; then
    echo_error "Script integrity check failed. Please download again."
    exit 1
fi

echo_info "Installation complete!"