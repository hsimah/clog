<?php

declare(strict_types=1);

namespace Clog\Runtime;

use Eleph\Runtime\Gateway\EntityGateway;
use Eleph\WordPress\Admin\Pages;
use Eleph\WordPress\Database\WpdbDatabase;
use Eleph\WordPress\Manifest\StorageManifest;
use Eleph\WordPress\Registration\PostTypeRegistrar;
use Eleph\WordPress\Viewer\WordPressViewerProvider;
use Eleph\WordPress\WordPress;
use Eleph\WordPress\WordPressAdaptor;
use Psr\Log\LoggerInterface;
use wpdb;

/**
 * The assembled runtime, as one object the plugin holds.
 *
 * Every layer below is separately useless — an adaptor with no hydrators, a unit of
 * work with no verifiers — and this is where they meet. Assembly is cheap: two
 * `require`s of generated PHP that opcache already holds, and no reflection until a
 * generated class is first asked for.
 *
 * Built lazily and once. WordPress loads plugins long before it knows whether a
 * request will touch an entity, so paying for this on every admin page and cron tick
 * would be waste; nothing here runs until something asks for the gateway.
 */
final class Clog
{
    /**
     * Each manifest sits in its own target's directory, inside the PHP tree.
     *
     * They used to be two files at the root of `generated/`, produced by the same run
     * that produced the entity classes. They are now produced by a target each — the
     * PHP builder cannot compile a storage schema, because that needs code that knows
     * what a table is — so a project that installs neither the driver nor the
     * integration has neither directory. The paths are relative to `$generated`.
     */
    private const STORAGE_MANIFEST = 'wordpress/storage-manifest.php';

    private const GRAPHQL_MANIFEST = 'wpgraphql/graphql-manifest.php';

    private const POST_TYPES = 'wordpress/post-types.php';

    private static ?self $instance = null;

    private ?EntityGateway $gateway = null;

    private ?StorageManifest $manifest = null;

    private ?WordPressAdaptor $adaptor = null;

    private function __construct(
        private readonly WpdbDatabase $database,
        private readonly string $generated,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * The shared instance, built from the globals on first use.
     */
    public static function instance(): self
    {
        if (null === self::$instance) {
            /** @var wpdb $wpdb */
            global $wpdb;

            self::$instance = new self(
                new WpdbDatabase($wpdb),
                CLOG_PLUGIN_DIR . 'generated/',
                new ErrorLogLogger(),
            );
        }

        return self::$instance;
    }

    /**
     * Entities addressed by name — the one entry point application code needs.
     *
     * The boot check runs here rather than on `plugins_loaded`: it is what refuses to
     * start while a generated interface has no implementation, and hanging it off the
     * first real use means a WordPress install whose admin never touches Clog is not
     * made unbootable by it.
     */
    public function gateway(): EntityGateway
    {
        if (null === $this->gateway) {
            $this->tables()->requireReady();
            $this->gateway = RuntimeFactory::create(
                $this->adaptor(),
                new WordPressViewerProvider(),
                $this->logger,
            );
        }

        return $this->gateway;
    }

    /**
     * Schema installation, for activation and the CLI.
     */
    public function tables(): Tables
    {
        return new Tables($this->database, $this->manifest());
    }

    public function migration(): \Clog\Migration\StorageUpgrade
    {
        return new \Clog\Migration\StorageUpgrade($this->database, $this->manifest());
    }

    public function adminPages(): Pages
    {
        return Pages::fromManifest($this->generated . 'wordpress/admin-pages.php', $this->gateway());
    }

    private function adaptor(): WordPressAdaptor
    {
        return $this->adaptor ??= WordPress::adaptor($this->database, $this->manifest());
    }

    private function manifest(): StorageManifest
    {
        return $this->manifest ??= WordPress::manifest($this->generated . self::STORAGE_MANIFEST);
    }

    public function graphqlManifestPath(): string
    {
        return $this->generated . self::GRAPHQL_MANIFEST;
    }

    /**
     * The post types the spec compiled to. Hook `register()` on `init`.
     *
     * Compiled, not derived: registration used to be a hand-written list in
     * `includes/post-types.php` that had to be kept in step with the spec by hand, and
     * before that the framework derived it per request from the spec compiler.
     */
    public function postTypes(): PostTypeRegistrar
    {
        return PostTypeRegistrar::fromManifest($this->generated . self::POST_TYPES);
    }
}
