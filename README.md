# Conde

Conde is a powerful Node.js environment manager inspired by Conda. It streamlines the management of Node.js environments, dependencies, and projects, enhancing the development workflow for developers.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [NPM Installation](#npm-installation)
  - [Manual Installation](#manual-installation)
  - [Shell Integration](#shell-integration)
- [Usage](#usage)
  - [Create an Environment](#create-an-environment)
  - [Activate an Environment](#activate-an-environment)
  - [Deactivate an Environment](#deactivate-an-environment)
  - [Remove an Environment](#remove-an-environment)
  - [Install Packages](#install-packages)
  - [List Environments and Packages](#list-environments-and-packages)
  - [Clean Unused Packages](#clean-unused-packages)
  - [Update Conde](#update-conde)
  - [Check Version](#check-version)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Isolated Environments:** Create and manage multiple isolated Node.js environments
- **Global Package Installation:** Install packages globally within environments
- **Seamless Activation/Deactivation:** Easily switch between environments
- **Automatic Updates:** Keep Conde and its tools up-to-date
- **Clean Utility:** Remove unused packages from the global store
- **Version Management:** Manage different versions of Node.js per environment

## Installation

### NPM Installation

```bash
npm install -g conde
```

### Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/siliconvuy/conde.git
   ```

2. Navigate to the project directory:
   ```bash
   cd conde
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Link the executable:
   ```bash
   npm link
   ```

### Shell Integration

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Conde initialization
source ~/.conde/scripts/conde.sh
```

Restart your shell or run:
```bash
source ~/.bashrc  # or source ~/.zshrc for Zsh
```

## Usage

### Create an Environment

Create a new environment with a specific Node.js version:

```bash
conde create my-env --node 18.14.0
```

### Activate an Environment

```bash
conde activate my-env
```

After activation, your prompt will show the active environment:
```bash
[my-env] user@host:~$ 
```

### Deactivate an Environment

```bash
conde deactivate
```

### Remove an Environment

Remove an existing environment:

```bash
conde remove my-env
```

Note: You cannot remove an active environment. Deactivate it first using `conde deactivate`.

### Install Packages

Install packages in the active environment:

```bash
conde install express
```

### List Environments and Packages

List all environments:
```bash
conde list envs
```

List packages in active environment:
```bash
conde list packages
```

### Clean Unused Packages

Remove unused packages from the global store:

```bash
conde clean
```

### Update Conde

Update Conde and packages in the active environment:

```bash
conde update
```

### Check Version

Display the current version:

```bash
conde version
```

## Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
