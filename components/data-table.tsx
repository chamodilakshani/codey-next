"use client";

import DataTable from "react-data-table-component";

type User = {
  id: string;
  firstName: string | null;
  emailAddresses: {
    emailAddress: string;
  }[];
};

export default function ClientTable({ users }: { users: User[] }) {
  const columns = [
  {
    name: "Email",
    selector: (row: User) =>
      row.emailAddresses[0]?.emailAddress ?? "No email",
  },
  {
    name: "First Name",
    selector: (row: User) => row.firstName ?? "—",
  },
];

  return <DataTable columns={columns} data={users} />;
}