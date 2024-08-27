import DirectionComponent from "@/components/direction/DirectionComponent";
import React from "react";

const page = ({ params }: any) => {
  return (
    <main>
      <DirectionComponent locale={params.locale} />
    </main>
  );
};
export default page;
