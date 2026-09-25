<?php

declare(strict_types=1);

namespace Clog\Runtime;

use Eleph\Runtime\Query\ValueDecoder;
use Psr\Container\ContainerInterface;
use ReflectionClass;
use ReflectionNamedType;
use RuntimeException;

/**
 * Shared generated services with explicit application-contract bindings.
 * Constructor autowiring is limited to class-typed dependencies; policies and
 * side effects are supplied by RuntimeFactory before the generated boot check.
 */
final class Container implements ContainerInterface
{
    /** @var array<string, object> */
    private array $instances = [];

    /** @var array<string, object> */
    private readonly array $shared;

    public function __construct()
    {
        $this->shared = [
            ValueDecoder::class => new ValueDecoder(),
        ];
    }

    public function has(string $id): bool
    {
        return isset($this->instances[$id])
            || isset($this->shared[$id])
            || (class_exists($id) && $this->isConstructible($id));
    }

    public function set(string $id, object $instance): void
    {
        $this->instances[$id] = $instance;
    }

    public function get(string $id): object
    {
        return $this->instances[$id] ??= $this->make($id);
    }

    private function make(string $id): object
    {
        if (isset($this->shared[$id])) {
            return $this->shared[$id];
        }

        if (!class_exists($id)) {
            throw new RuntimeException(sprintf(
                'Cannot build "%s": no such class. If it is generated, run `eleph generate`.',
                $id,
            ));
        }

        $constructor = (new ReflectionClass($id))->getConstructor();

        if (null === $constructor) {
            return new $id();
        }

        $arguments = [];

        foreach ($constructor->getParameters() as $parameter) {
            $type = $parameter->getType();

            if (!$type instanceof ReflectionNamedType || $type->isBuiltin()) {
                throw new RuntimeException(sprintf(
                    'Cannot build "%s": parameter $%s is not a resolvable class type.',
                    $id,
                    $parameter->getName(),
                ));
            }

            $arguments[] = $this->get($type->getName());
        }

        return new $id(...$arguments);
    }

    /**
     * @param class-string $id
     */
    private function isConstructible(string $id): bool
    {
        $reflection = new ReflectionClass($id);

        if (!$reflection->isInstantiable()) {
            return false;
        }

        $constructor = $reflection->getConstructor();

        if (null === $constructor) {
            return true;
        }

        foreach ($constructor->getParameters() as $parameter) {
            $type = $parameter->getType();

            if (!$type instanceof ReflectionNamedType || $type->isBuiltin()) {
                return false;
            }
        }

        return true;
    }
}
