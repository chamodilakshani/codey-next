"use client";

import DataTable from "react-data-table-component";

export default function ClientTable({ users }: { users: any[] }) {
    console.log(users);
    
  const columns = [
    {
      name: "Email",
      selector: (row: any) => row.emailAddresses[0]?.emailAddress,
    },
    {
      name: "First Name",
      selector: (row: any) => row.firstName,
    },
  ];

  return <DataTable columns={columns} data={users} />;
}