# Conde

Conde is a powerful Node.js environment manager inspired by Conda. It streamlines the management of Node.js environments, dependencies, and projects, enhancing the development workflow for developers.

## Table of Contents

- [Conde](#conde)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
    - [Manual Installation](#manual-installation)
  - [Usage](#usage)
    - [Create an Environment](#create-an-environment)
    - [Activate an Environment](#activate-an-environment)
    - [Deactivate an Environment](#deactivate-an-environment)
    - [Install Packages](#install-packages)
    - [List Environments and Packages](#list-environments-and-packages)
    - [Clean Unused Packages](#clean-unused-packages)
    - [Update Conde](#update-conde)
    - [Check Version](#check-version)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- **Isolated Environments:** Create and manage multiple isolated Node.js environments to prevent dependency conflicts.
- **Global Package Installation:** Install packages globally within environments to reduce duplication and save disk space.
- **Seamless Activation/Deactivation:** Easily switch between environments with simple commands.
- **Automatic Updates:** Keep Conde and its internal tools up-to-date with the latest features and security patches.
- **Clean Utility:** Remove unused packages from the global store to maintain a clean development setup.
- **Version Management:** Manage different versions of Node.js effortlessly within each environment.

## Installation

You can install **Conde** using the provided installation script:

```bash
curl -sL https://raw.githubusercontent.com/siliconvuy/conde/main/scripts/install.sh | bash
```

### Manual Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/siliconvuy/conde.git
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd conde
   ```

3. **Install Dependencies:**

   ```bash
   npm install
   ```

4. **Link the Executable:**

   ```bash
   npm link
   ```

## Usage

### Create an Environment

Create a new Conde environment with a specific Node.js version:

```bash
conde create <envName> --node <version>
```

*Example:*

```bash
conde create my-env --node 18.14.0
```

### Activate an Environment

Activate an existing environment:

```bash
conde activate <envName>
```

*Example:*

```bash
conde activate my-env
```

### Deactivate an Environment

Deactivate the currently active environment:

```bash
conde deactivate
```

### Install Packages

Install a package globally within the active environment:

```bash
conde install <packageName>
```

*Example:*

```bash
conde install express
```

### List Environments and Packages

- **List All Environments:**

  ```bash
  conde list envs
  ```

- **List All Packages in the Active Environment:**

  ```bash
  conde list packages
  ```

### Clean Unused Packages

Remove packages that are no longer used across any environments:

```bash
conde clean
```

### Update Conde

Update Conde to the latest version and update packages in the active environment:

```bash
conde update
```

### Check Version

Display the current version of Conde:

```bash
conde version
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**
4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

## License

This project is licensed under the [MIT License](LICENSE).
