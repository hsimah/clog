# PHP toolchain for Clog: Composer, Rust, and the Elephentity generators.
# Containers are created per command and removed on exit.
FROM docker.io/library/rust:1 AS rust
FROM docker.io/library/php:8.3-cli

COPY --from=rust /usr/local/cargo /usr/local/cargo
COPY --from=rust /usr/local/rustup /usr/local/rustup
ENV RUSTUP_HOME=/usr/local/rustup
ENV PATH="/usr/local/cargo/bin:${PATH}"
ENV CARGO_HOME=/composer/cargo

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        build-essential \
        unzip \
        libonig-dev \
        libzip-dev \
    # mbstring and zip are not in the base image; the spec compiler needs the former,
    # Composer wants the latter to avoid shelling out to unzip.
    && docker-php-ext-install -j"$(nproc)" mbstring zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=docker.io/library/composer:2 /usr/bin/composer /usr/bin/composer

# Composer refuses to run as root without this, and rootless podman maps the host
# user to root inside the container.
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /work/clog/server
