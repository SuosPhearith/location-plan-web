import Image from "next/image";
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const LayoutComponent: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col">
      <div className="w-full bg-white h-[7vh] border border-b-2 flex items-center justify-center">
        <div className="flex justify-between items-center w-11/12 bg-slate-400">
          <div>
            <Image src="/logo.svg" alt="logo" width={120} height={120} />
          </div>
          <div className="flex items-center">
            <div>lang</div>
            <div>Account</div>
          </div>
        </div>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
};

export default LayoutComponent;
