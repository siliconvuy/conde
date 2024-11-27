# Conde

A Node.js environment manager inspired by Conda. Manage multiple Node.js environments without needing Node.js pre-installed.

## Installation

One-line installation:
```bash
curl -fsSL https://raw.githubusercontent.com/siliconvuy/conde/main/scripts/install.sh | bash
```

Then add to your shell (add to ~/.bashrc or ~/.zshrc):
```bash
source ~/.conde/scripts/conde.sh
```

## Usage

Create a new environment:
```bash
conde create myenv --node 20.5.0
```

Activate an environment:
```bash
conde activate myenv
```

Install packages:
```bash
conde install express
```

List environments:
```bash
conde list envs
```

List installed packages:
```bash
conde list packages
```

## Features

- Zero dependencies - no need to install Node.js first
- Isolated environments with different Node.js versions
- Centralized package management
- Shell integration
- Automatic environment activation
