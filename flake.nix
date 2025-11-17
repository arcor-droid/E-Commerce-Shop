{
  description = "E-Commerce Shop Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Python development
            python312
            uv
            
            # Node.js for Angular
            nodejs_22
            nodePackages.npm
            
            # Angular CLI
            nodePackages."@angular/cli"
            
            # Database tools
            mysql80
            
            # Development tools
            git
            curl
            jq
            
            # Optional but helpful
            httpie
            
          ];

          shellHook = ''
            echo "🚀 E-Commerce Shop Development Environment"
            echo "=================================="
            echo "Python: $(python --version)"
            echo "Node: $(node --version)"
            echo "npm: $(npm --version)"
            echo "uv: $(uv --version)"
            echo ""
            echo "Available commands:"
            echo "  - Backend: cd backend && uv venv && source .venv/bin/activate"
            echo "  - Frontend: cd frontend && npm install"
            echo "  - Docker: docker-compose up --build"
            echo ""
          '';
        };
      }
    );
}
