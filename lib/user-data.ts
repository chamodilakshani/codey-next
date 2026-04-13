import { clerkClient } from "@clerk/nextjs/server";

export async function GetAllUsers() {
    const client = await clerkClient()

    const users = await client.users.getUserList();

    return users;
}