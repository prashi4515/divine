"use client";

import Link from "next/link";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/features/auth";
import { asCmsRoles, ROLE_LABELS } from "@/lib/rbac";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminUserMenu() {
  const { user } = useAuth();
  if (!user) return null;

  const primaryRole = asCmsRoles(user.roles)[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus-visible:ring-ring rounded-full focus-visible:outline-none focus-visible:ring-1"
        aria-label="Account menu"
      >
        <Avatar
          name={user.displayName}
          src={user.avatarUrl ?? undefined}
          size="sm"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="text-foreground block text-sm font-medium">{user.displayName}</span>
          <span className="block truncate text-xs">{user.email}</span>
          {primaryRole ? (
            <span className="text-muted-foreground mt-1 block text-[11px]">
              {ROLE_LABELS[primaryRole]}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="h-4 w-4" aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <Settings className="h-4 w-4" aria-hidden />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout">
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
