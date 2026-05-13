<?php

namespace App\Support;

class Permissions
{
    public const ADMIN = 'admin';
    public const HR = 'hr';
    public const VIEWER = 'viewer';

    private const ROLE_PERMISSIONS = [
        self::ADMIN => [
            'employees.view',
            'employees.create',
            'employees.update',
            'employees.delete',
            'organization.manage',
            'users.manage',
        ],
        self::HR => [
            'employees.view',
            'employees.create',
            'employees.update',
            'organization.manage',
        ],
        self::VIEWER => [
            'employees.view',
        ],
    ];

    public static function roles(): array
    {
        return array_keys(self::ROLE_PERMISSIONS);
    }

    public static function normalizeRole(?string $role): string
    {
        return in_array($role, self::roles(), true) ? $role : self::VIEWER;
    }

    public static function forRole(?string $role): array
    {
        return self::ROLE_PERMISSIONS[self::normalizeRole($role)];
    }

    public static function roleHas(?string $role, string $permission): bool
    {
        return in_array($permission, self::forRole($role), true);
    }
}
