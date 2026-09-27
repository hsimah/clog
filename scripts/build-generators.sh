#!/bin/sh
# Run from server/ after installing development dependencies.
set -eu

for package in codegen codegen-php codegen-sqlite codegen-graphql-php; do
    package_dir="vendor/elephentity/$package"
    cargo build --release --locked \
        --manifest-path "$package_dir/Cargo.toml" \
        --target-dir "$package_dir/target"
done
