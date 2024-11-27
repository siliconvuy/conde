#!/bin/bash

# Exit on error
set -e

# Test utilities
assert() {
    if [ $1 -ne 0 ]; then
        echo "Test failed: $2"
        exit 1
    fi
}

echo "Running installation tests..."

# Test clean installation
rm -rf ~/.conde
bash scripts/install.sh
assert $? "Clean installation failed"

# Test directory structure
[ -d ~/.conde ] && [ -d ~/.conde/bin ] && [ -d ~/.conde/envs ]
assert $? "Directory structure check failed"

# Test shell integration
source ~/.conde/scripts/conde.sh
type conde >/dev/null 2>&1
assert $? "Shell integration failed"

# Test environment creation
conde create test-env --node 20.5.0
assert $? "Environment creation failed"

# Test environment activation
conde activate test-env
[ ! -z "$CONDE_ENV" ]
assert $? "Environment activation failed"

# Test package installation
conde install express
[ -d ~/.conde/envs/test-env/lib/node_modules/express ]
assert $? "Package installation failed"

echo "All tests passed!" 