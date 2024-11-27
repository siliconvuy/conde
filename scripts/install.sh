#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Variables
CONDE_DIR="$HOME/.conde"
BIN_DIR="$CONDE_DIR/bin"
ENVS_DIR="$CONDE_DIR/envs"
PACKAGES_DIR="$CONDE_DIR/packages"
SCRIPTS_DIR="$CONDE_DIR/scripts"
CONDE_SH="$CONDE_DIR/conde.sh"
RELEASES_URL="https://raw.githubusercontent.com/siliconvuy/conde/main/releases.json"
CONDE_SCRIPT_URL="https://raw.githubusercontent.com/siliconvuy/conde/main/lib/conde.js"

# Functions for logging
echo_info() {
  echo -e "\033[1;34m[Conde]\033[0m $1"
}

echo_error() {
  echo -e "\033[1;31m[Conde ERROR]\033[0m $1" >&2
}

# Create necessary directories
echo_info "Creating necessary directories at $CONDE_DIR..."
mkdir -p "$BIN_DIR" "$ENVS_DIR" "$PACKAGES_DIR" "$SCRIPTS_DIR"

# Check for jq installation
if ! command -v jq &> /dev/null; then
    echo_info "jq is not installed. Attempting to install..."
    OS="$(uname | tr '[:upper:]' '[:lower:]')"
    if [ "$OS" == "linux" ]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y jq
        elif command -v yum &> /dev/null; then
            sudo yum install -y jq
        else
            echo_error "Unsupported package manager. Please install 'jq' manually."
            exit 1
        fi
    elif [ "$OS" == "darwin" ]; then
        if command -v brew &> /dev/null; then
            brew install jq
        else
            echo_error "Homebrew is not installed. Please install 'jq' manually."
            exit 1
        fi
    else
        echo_error "Unsupported OS for automatic 'jq' installation. Please install 'jq' manually."
        exit 1
    fi
fi

# Download releases.json
echo_info "Downloading releases information..."
curl -sL "$RELEASES_URL" -o "/tmp/releases.json"

if [ ! -f "/tmp/releases.json" ]; then
    echo_error "Failed to download 'releases.json'. Check the URL and your internet connection."
    exit 1
fi

# Get the latest release information
LATEST_CONDE_VERSION=$(jq -r '.releases[-1].conde_version' "/tmp/releases.json")
LATEST_NODE_VERSION=$(jq -r '.releases[-1].node_version' "/tmp/releases.json")

echo_info "Latest Conde version: $LATEST_CONDE_VERSION"
echo_info "Node.js version to install: $LATEST_NODE_VERSION"

# Download and install Node.js
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

NODE_TARBALL="node-v$LATEST_NODE_VERSION-$OS-$ARCH.tar.xz"
NODE_URL="https://nodejs.org/dist/v$LATEST_NODE_VERSION/$NODE_TARBALL"

echo_info "Downloading Node.js from $NODE_URL..."
curl -o "/tmp/$NODE_TARBALL" -L "$NODE_URL"

if [ ! -f "/tmp/$NODE_TARBALL" ]; then
    echo_error "Failed to download Node.js. Check the URL and your internet connection."
    exit 1
fi

echo_info "Extracting Node.js..."
tar -xf "/tmp/$NODE_TARBALL" -C "/tmp"

echo_info "Installing Node.js to $BIN_DIR..."
cp -r "/tmp/node-v$LATEST_NODE_VERSION-$OS-$ARCH/"* "$BIN_DIR/"

# Clean up temporary files
rm -rf "/tmp/$NODE_TARBALL" "/tmp/node-v$LATEST_NODE_VERSION-$OS-$ARCH" "/tmp/releases.json"

# Download the main Conde script
echo_info "Downloading main Conde script..."
curl -sL "$CONDE_SCRIPT_URL" -o "$CONDE_SH"

if [ ! -f "$CONDE_SH" ]; then
    echo_error "Failed to download 'conde.js'. Check the URL and your internet connection."
    exit 1
fi

chmod +x "$CONDE_SH"

# Save Conde version
echo "$LATEST_CONDE_VERSION" > "$CONDE_DIR/version"

# Add alias to shell profile
SHELL_PROFILE=""
if [ -n "$ZSH_VERSION" ]; then
  SHELL_PROFILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  SHELL_PROFILE="$HOME/.bashrc"
else
  SHELL_PROFILE="$HOME/.profile"
fi

echo_info "Adding 'conde' alias to your shell profile ($SHELL_PROFILE)..."
echo "alias conde='node $CONDE_SH'" >> "$SHELL_PROFILE"

# Inform the user
echo_info "Conde installation complete. Please restart your terminal or run 'source $SHELL_PROFILE' to apply changes."