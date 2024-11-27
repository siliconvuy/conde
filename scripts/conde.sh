#!/bin/bash

# Conde shell initialization script
# This script should be sourced, not executed

# Environment variables
export CONDE_ROOT="$HOME/.conde"
export CONDE_BIN="$CONDE_ROOT/bin"
export CONDE_ENVS="$CONDE_ROOT/envs"
export CONDE_PACKAGES="$CONDE_ROOT/packages"
export CONDE_LIB="$CONDE_ROOT/lib"

# Path manipulation functions
_conde_add_to_path() {
    local dir="$1"
    if [[ ":$PATH:" != *":$dir:"* ]]; then
        export PATH="$dir:$PATH"
    fi
}

_conde_remove_from_path() {
    local dir="$1"
    export PATH=${PATH//:$dir/}
}

# Prompt management
_conde_set_prompt() {
    local env_name="$1"
    if [ -n "$ZSH_VERSION" ]; then
        # ZSH prompt
        if [ -z "$CONDE_OLD_PROMPT" ]; then
            export CONDE_OLD_PROMPT="$PROMPT"
        fi
        PROMPT="[%F{blue}${env_name}%f] $CONDE_OLD_PROMPT"
    else
        # BASH prompt
        if [ -z "$CONDE_OLD_PS1" ]; then
            export CONDE_OLD_PS1="$PS1"
        fi
        PS1="[\[\033[34m\]${env_name}\[\033[0m\]] $CONDE_OLD_PS1"
    fi
}

_conde_restore_prompt() {
    if [ -n "$ZSH_VERSION" ]; then
        [ -n "$CONDE_OLD_PROMPT" ] && PROMPT="$CONDE_OLD_PROMPT"
        unset CONDE_OLD_PROMPT
    else
        [ -n "$CONDE_OLD_PS1" ] && PS1="$CONDE_OLD_PS1"
        unset CONDE_OLD_PS1
    fi
}

# Environment management
conde_activate() {
    if [ -z "$1" ]; then
        echo "Error: Environment name required"
        return 1
    fi

    local env_name="$1"
    local env_path="$CONDE_ENVS/$env_name"

    # Validate environment
    if [ ! -d "$env_path" ]; then
        echo "Error: Environment '$env_name' not found"
        return 1
    fi

    # Deactivate current environment if exists
    [ -n "$CONDE_ENV" ] && conde_deactivate

    # Set environment variables
    export CONDE_ENV="$env_name"
    export CONDE_ENV_PATH="$env_path"
    export NODE_PATH="$env_path/lib/node_modules"

    # Update PATH to include both bin directories
    # Asegurarse de que los binarios del entorno tengan prioridad
    export PATH="$env_path/lib/node_modules/.bin:$env_path/bin:$PATH"

    # Create npm wrapper function (silently)
    eval "$(cat <<EOF
npm() {
    local cmd="\$1"
    if [ "\$cmd" = "install" ] || [ "\$cmd" = "i" ]; then
        if [ ! -f "package.json" ]; then
            echo "Error: No package.json found in current directory"
            return 1
        fi

        # Usar el gestor de paquetes de conde
        node "$CONDE_BIN/conde.js" install --from-package-json ./package.json
        return \$?
    elif [ "\$cmd" = "run" ]; then
        # Asegurar que los scripts se ejecuten con los binarios del entorno
        PATH="$env_path/lib/node_modules/.bin:$PATH" command npm "\$@"
        return \$?
    else
        command npm "\$@"
    fi
}
EOF
)"

    # Export the npm function silently
    export -f npm >/dev/null 2>&1

    # Update prompt
    _conde_set_prompt "$env_name"

    # Rehash para que zsh reconozca los nuevos binarios
    if [ -n "$ZSH_VERSION" ]; then
        rehash
    fi

    echo "Successfully activated environment '$env_name'"
}

conde_deactivate() {
    if [ -z "$CONDE_ENV" ]; then
        echo "No active environment"
        return 1
    fi

    local env_name="$CONDE_ENV"
    local env_path="$CONDE_ENV_PATH"

    # Remove environment paths from PATH
    export PATH=$(echo $PATH | tr ':' '\n' | grep -v "$env_path" | tr '\n' ':' | sed 's/:$//')

    # Remove npm wrapper function
    unset -f npm

    # Restore prompt
    _conde_restore_prompt

    # Unset environment variables
    unset CONDE_ENV
    unset CONDE_ENV_PATH
    unset NODE_PATH

    # Rehash para que zsh actualice los binarios disponibles
    if [ -n "$ZSH_VERSION" ]; then
        rehash
    fi

    echo "Successfully deactivated environment '$env_name'"
}

# Command wrapper
conde() {
    if [ $# -eq 0 ]; then
        node "$CONDE_BIN/conde.js" --help
        return
    fi

    local command="$1"
    shift

    case "$command" in
        "activate")
            conde_activate "$@"
            ;;
        "deactivate")
            conde_deactivate
            ;;
        *)
            node "$CONDE_BIN/conde.js" "$command" "$@"
            ;;
    esac
}

# Auto-completion
_conde_complete() {
    local cur="${COMP_WORDS[COMP_CWORD]}"
    local prev="${COMP_WORDS[COMP_CWORD-1]}"

    case "$prev" in
        "conde")
            COMPREPLY=($(compgen -W "activate deactivate create install list clean update version remove" -- "$cur"))
            ;;
        "activate"|"remove")
            COMPREPLY=($(compgen -W "$(ls $CONDE_ENVS 2>/dev/null)" -- "$cur"))
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}

# Initialize completion
if [ -n "$BASH_VERSION" ]; then
    complete -F _conde_complete conde
elif [ -n "$ZSH_VERSION" ]; then
    autoload -U +X compinit && compinit
    autoload -U +X bashcompinit && bashcompinit
    complete -F _conde_complete conde
fi

# Initialize Conde
_conde_add_to_path "$CONDE_BIN"

# Add default npm wrapper silently when no environment is active
if [ -z "$CONDE_ENV" ]; then
    eval "$(cat <<EOF
npm() {
    local cmd="\$1"
    if [ "\$cmd" = "install" ] || [ "\$cmd" = "i" ]; then
        echo "Error: No active conde environment. Please activate one with 'conde activate <env>' first."
        return 1
    else
        command npm "\$@"
    fi
}
EOF
)"
    export -f npm >/dev/null 2>&1
fi 