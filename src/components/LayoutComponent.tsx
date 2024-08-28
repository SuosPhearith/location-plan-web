"use client";
import AccountComponent from "./AccountComponent";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { ReactNode } from "react";
import LocalSwitcher from "./LocaleSwitcher";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

const LayoutComponent: React.FC<LayoutProps> = ({ children }) => {
  const t = useTranslations("HomePage");

  return (
    <React.Fragment>
      <div className="flex flex-col w-full">
        <div className="w-full bg-gradient-to-r from-slate-200 to-gray-200 h-[7vh] min-h-[60px] border border-b-1 border-t-0 border-e-0 border-s-0 border-slate-400 flex items-center justify-center">
          <div className="flex justify-between items-center w-11/12">
            <Link href={"/"}>
              <Image src="/logo.svg" alt="logo" width={120} height={120} />
            </Link>
            <div className="flex items-center">
              <LocalSwitcher />
              <AccountComponent />
            </div>
          </div>
        </div>
        <div className="px-4 flex justify-center w-screen">{children}</div>
      </div>
    </React.Fragment>
  );
};

export default LayoutComponent;
