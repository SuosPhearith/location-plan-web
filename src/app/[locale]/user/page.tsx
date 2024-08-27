import UserComponent from "@/components/UserComponent";
import React from "react";

const page = ({ params }: any) => {
  return (
    <main>
      <UserComponent locale={params.locale} />
    </main>
  );
};
export default page;
