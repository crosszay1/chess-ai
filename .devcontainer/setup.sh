#!/usr/bin/env bash

# For debian based enviroments only unfortuantly, will probably only be using them though so it's fine

sudo apt install curl fish # Get curl & fish
curl -fsSL https://tailscale.com/install.sh | sh # Install tailscale
curl https://cursor.com/install -fsS | bash # Install cursor
