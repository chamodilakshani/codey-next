"use client";

import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon } from "lucide-react";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "learner";
  createdAtLabel: string;
};

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function UserForm({
  mode,
  user,
}: {
  mode: "create" | "edit";
  user?: UserRow;
}) {
  const action = mode === "create" ? createUserAction : updateUserAction;

  return (
    <form action={action} className="grid gap-3 overflow-y-auto px-4 pb-4">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <div>
        <Label htmlFor={`${mode}-name-${user?.id ?? "new"}`}>Name</Label>
        <Input
          id={`${mode}-name-${user?.id ?? "new"}`}
          name="name"
          defaultValue={user?.name ?? ""}
        />
      </div>
      <div>
        <Label htmlFor={`${mode}-email-${user?.id ?? "new"}`}>Email</Label>
        <Input
          id={`${mode}-email-${user?.id ?? "new"}`}
          name="email"
          type="email"
          defaultValue={user?.email}
          required={mode === "create"}
          disabled={mode === "edit"}
        />
      </div>
      {mode === "create" ? (
        <div>
          <Label htmlFor={`${mode}-password-${user?.id ?? "new"}`}>Password</Label>
          <Input
            id={`${mode}-password-${user?.id ?? "new"}`}
            name="password"
            type="password"
            minLength={8}
            required
          />
        </div>
      ) : null}
      <div>
        <Label htmlFor={`${mode}-role-${user?.id ?? "new"}`}>Role</Label>
        <select
          id={`${mode}-role-${user?.id ?? "new"}`}
          name="role"
          defaultValue={user?.role ?? "learner"}
          className={selectClassName}
        >
          <option value="learner">Learner</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <Button type="submit">
          {mode === "create" ? "Create User" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export function UsersCrudTable({ users }: { users: UserRow[] }) {
  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">{users.length} total records</p>
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button>
              <PlusIcon />
              Add User
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create User</DrawerTitle>
              <DrawerDescription>Add a new user record.</DrawerDescription>
            </DrawerHeader>
            <UserForm mode="create" />
          </DrawerContent>
        </Drawer>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name?.trim() || "Unnamed"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.createdAtLabel}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Drawer direction="right">
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Edit User</DrawerTitle>
                        <DrawerDescription>Update user information.</DrawerDescription>
                      </DrawerHeader>
                      <UserForm mode="edit" user={user} />
                    </DrawerContent>
                  </Drawer>
                  <form action={deleteUserAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Delete
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
