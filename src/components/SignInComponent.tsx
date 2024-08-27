"use client";
import { signIn, SignIn } from "@/api/signin";
import { saveToken } from "@/services/saveToken";
import { useMutation } from "@tanstack/react-query";
import { Input, message } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

const SignInComponent = () => {
  const router = useRouter();
  const { mutateAsync: signInMutate } = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      message.success("Sign in Successfully");
      router.push("/");
    },
    onError: (error: any) => {
      message.error(error);
    },
  });
  const { handleSubmit, control } = useForm<SignIn>();
  const onSubmit: SubmitHandler<SignIn> = async (data) => {
    const userAgent = navigator.userAgent;
    const submitData = { ...data, userAgent };
    const res = await signInMutate(submitData);
    saveToken(res.data.accessToken, res.data.refreshToken);
    window.localStorage.setItem("name", res.data.user.name || "User");
    window.localStorage.setItem(
      "avatar",
      res.data.user.avatar || "/vital2.png"
    );
  };
  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center">
      {/* login container */}
      <div className="bg-gray-100 flex rounded-2xl shadow-lg max-w-3xl p-5 items-center">
        {/* image */}
        <div className="md:block hidden w-1/2 mt-5">
          <Image src="/vital2.png" alt="logo" width={250} height={120} />
        </div>
        {/* form */}
        <div className="md:w-1/2 px-2">
          <Image
            src="/logo.svg"
            alt="logo"
            width={200}
            height={120}
            className="mb-4"
          />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <p className="text-slate-500">Email:</p>
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="example@gmail.com"
                  size="large"
                  className="mb-3"
                />
              )}
            />
            <p className="text-slate-500">Password:</p>
            <Controller
              name="password"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Enter your password"
                  size="large"
                  className="mb-3"
                />
              )}
            />
            <input
              type="submit"
              className="bg-[#afaf4c] rounded-md text-white py-2.5 hover:scale-105 duration-300 mt-2 cursor-pointer"
              value={"Login"}
            />
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInComponent;
