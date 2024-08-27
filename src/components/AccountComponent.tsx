"use client";
import React, { useState, useRef, useEffect } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import logoutAPI from "@/services/logout";
import { Input, message, Modal, Popconfirm } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  ChangePassword,
  deleteAccount,
  getMe,
  getSession,
  logoutAllDevices,
  logoutDevice,
  updateProfile,
  UpdateProfile,
  uploadAvatar,
  User,
} from "@/api/account";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FiTrash2 } from "react-icons/fi";
const imageUrl = process.env.NEXT_PUBLIC_IMG_URL;

const AccountComponent = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAcc, setIsDeleteAcc] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const queryClient = useQueryClient();

  const showModal = async (data: User | undefined) => {
    setValueUpdateProfile("name", data?.name || "");
    setValueUpdateProfile("email", data?.email || "");
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetUpdateProfile();
    resetChangePassword();
  };

  useEffect(() => {
    // This code runs only on the client-side
    if (typeof window !== "undefined") {
      setUserName(window.localStorage.getItem("name"));
    }
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUploadAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await submitUploadAvatar({ file: file });
  };

  const { mutateAsync: submitUploadAvatar, isPending: isPendingUploadAvatar } =
    useMutation({
      mutationFn: uploadAvatar,
      onSuccess: () => {
        message.success("Updated successfully");
        queryClient.invalidateQueries({ queryKey: ["me"] });
      },
      onError: (error: any) => {
        message.error(error as string);
      },
    });

  const {
    mutateAsync: submitUpdateProfile,
    isPending: isPendingUpdateProfile,
  } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data: any) => {
      window.localStorage.setItem("name", data.data.name || "User");
      window.localStorage.setItem("avatar", data.data.avatar || "/user.png");
      message.success("Updated successfully");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      message.error(error as string);
    },
  });

  const {
    mutateAsync: submitChangePassword,
    isPending: isPendingChangePassword,
  } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      message.success("Updated successfully");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      resetChangePassword();
    },
    onError: (error: any) => {
      message.error(error as string);
    },
  });

  const {
    mutateAsync: submitLogoutAllDevices,
    isPending: isPendingLogoutAllDevices,
  } = useMutation({
    mutationFn: logoutAllDevices,
    onSuccess: () => {
      window.location.href = "/en/auth/signin";
    },
    onError: (error: any) => {
      message.error(error as string);
    },
  });

  const {
    mutateAsync: submitDeleteAccount,
    isPending: isPendingDeleteAccount,
  } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      window.location.href = "/en/auth/signin";
    },
    onError: (error: any) => {
      message.error(error as string);
    },
  });

  const { mutateAsync: submitLogoutDevice, isPending: isPendingLogoutDevice } =
    useMutation({
      mutationFn: logoutDevice,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["userSession"] });
        message.success("Remove successfully");
      },
      onError: (error: any) => {
        message.error(error as string);
      },
    });

  const cancelConfrim = () => {
    setIsDeleteAcc(false);
    setConfirmText("");
  };

  const handleLogoutDevice = async (session: string) => {
    await submitLogoutDevice(session);
  };

  const handleLogoutAllDevices = async () => {
    await submitLogoutAllDevices();
  };

  const confirmDelete = async () => {
    if (confirmText !== "CONFIRM") {
      return message.error("Please check confirm text!");
    }
    await submitDeleteAccount();
  };

  const {
    handleSubmit: handleSubmitUpdateProfile,
    setValue: setValueUpdateProfile,
    reset: resetUpdateProfile,
    control: controlUpdateProfile,
    formState: { errors },
  } = useForm<UpdateProfile>();
  const onSubmit: SubmitHandler<UpdateProfile> = async (data) => {
    await submitUpdateProfile(data);
  };

  const {
    handleSubmit: handleSubmitChangePassword,
    reset: resetChangePassword,
    control: controlChangePassword,
    formState: { errors: errorsChangePassword },
  } = useForm<ChangePassword>();
  const onSubmitChangePassword: SubmitHandler<ChangePassword> = async (
    data
  ) => {
    await submitChangePassword(data);
  };

  const { data, isError, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const [pageSize, setPageSize] = useState(10);

  const {
    data: UserSession,
    isError: isErrorUserSession,
    isLoading: isLoadingUserSession,
  } = useQuery({
    queryKey: ["userSession", pageSize],
    queryFn: () => getSession({ pageSize }),
  });

  if (isError || isErrorUserSession) {
    return <div>error</div>;
  }

  if (isLoading || isLoadingUserSession) {
    return <div>loading...</div>;
  }

  const convertToDateTime = (isoString: string): string => {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex">
        <div className="h-[40px] w-[40px] rounded-full bg-slate-300 me-3 ms-4">
          <Image
            src={`${imageUrl}${data?.avatar}`}
            width={50}
            height={50}
            alt="profile"
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <button
          onClick={toggleDropdown}
          className="flex items-center cursor-pointer hover:text-slate-600"
        >
          <span className="mr-2">{userName}</span>
          <MdOutlineKeyboardArrowDown />
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute p-2 z-50 right-0 w-32 mt-1 origin-top-right bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-1 flex flex-col items-center">
            <div className="h-[50px] w-[50px] rounded-full bg-slate-300">
              <Image
                src={`${imageUrl}${data?.avatar}`}
                width={50}
                height={50}
                alt="profile"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div
              onClick={() => showModal(data)}
              className="hover:bg-slate-100 border border-slate-400 w-[80%] text-center mt-2 rounded-md py-1 cursor-pointer"
            >
              Profile
            </div>
            <div
              onClick={() => logoutAPI()}
              className="hover:bg-slate-100 border border-slate-400 w-[80%] text-center mt-2 rounded-md py-1 cursor-pointer"
            >
              Logout
            </div>
          </div>
        </div>
      )}
      <Modal
        title="Profile"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        width={1000}
        maskClosable={false}
      >
        <div className="flex gap-2">
          <div className="w-2/5 p-1">
            <form onSubmit={handleSubmitUpdateProfile(onSubmit)}>
              <div className="h-[100px] w-[100px]">
                <Image
                  src={`${imageUrl}${data?.avatar}`}
                  width={100}
                  height={100}
                  alt="profile"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <input
                type="file"
                className="mt-1 mb-3"
                onChange={handleUploadAvatar}
                disabled={isPendingUploadAvatar}
              />
              <div>
                <p>Name:</p>
                <Controller
                  name="name"
                  control={controlUpdateProfile}
                  rules={{ required: true, minLength: 3 }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Name" />
                  )}
                />
                {errors.name && (
                  <span className="text-sm text-red-800">
                    Please input valid name.
                  </span>
                )}
              </div>
              <div>
                <p>Email:</p>
                <Controller
                  name="email"
                  control={controlUpdateProfile}
                  rules={{
                    required: true,
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please input a valid email.",
                    },
                  }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Email" />
                  )}
                />
                {errors.email && (
                  <span className="text-sm text-red-800">
                    Please input valid email.
                  </span>
                )}
              </div>
              <div className="w-full flex justify-end mt-2">
                <button
                  disabled={isPendingUpdateProfile}
                  type="submit"
                  className="px-2 py-1 bg-slate-500 rounded-sm text-white"
                >
                  Save change
                </button>
              </div>
            </form>

            <form onSubmit={handleSubmitChangePassword(onSubmitChangePassword)}>
              <div>
                <p>Current Password:</p>
                <Controller
                  name="currentPassword"
                  control={controlChangePassword}
                  rules={{ required: true, minLength: 6 }}
                  render={({ field }) => (
                    <Input.Password {...field} placeholder="Current Password" />
                  )}
                />
                {errorsChangePassword.currentPassword && (
                  <span className="text-sm text-red-800">
                    Password must be longer than 6.
                  </span>
                )}
              </div>
              <div>
                <p>New Password:</p>
                <Controller
                  name="newPassword"
                  control={controlChangePassword}
                  rules={{ required: true, minLength: 6 }}
                  render={({ field }) => (
                    <Input.Password {...field} placeholder="New Password" />
                  )}
                />
                {errorsChangePassword.newPassword && (
                  <span className="text-sm text-red-800">
                    Password must be longer than 6.
                  </span>
                )}
              </div>
              <div>
                <p>Confirm New Password:</p>
                <Controller
                  name="confirmPassword"
                  control={controlChangePassword}
                  rules={{ required: true, minLength: 6 }}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="Confirm New Password"
                    />
                  )}
                />
                {errorsChangePassword.confirmPassword && (
                  <span className="text-sm text-red-800">
                    Password must be longer than 6.
                  </span>
                )}
              </div>
              <div className="w-full flex justify-end mt-2">
                <button
                  disabled={isPendingChangePassword}
                  type="submit"
                  className="px-2 py-1 bg-slate-500 rounded-sm text-white"
                >
                  Save change
                </button>
              </div>
            </form>
          </div>
          <div className="w-3/5 p-1 flex flex-col justify-between ">
            <div className="h-4/5 bg-slate-50 rounded-md">
              <div className="max-h-[410px] overflow-auto">
                <div className="flex w-full bg-gray-200 p-1 rounded-sm">
                  <div className="w-[10%]">No.</div>
                  <div className="w-1/5">Device</div>
                  <div className="w-1/5">Browser</div>
                  <div className="w-2/5">DateTime</div>
                  <div className="w-[10%]">Action</div>
                </div>
                {UserSession?.data.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex w-full bg-gray-100 p-2 rounded-sm hover:bg-slate-50"
                  >
                    <div className="w-[10%]">{index + 1}</div>
                    <div className="w-1/5">{item.device}</div>
                    <div className="w-1/5">{item.browser}</div>
                    <div className="w-2/5">
                      {convertToDateTime(item.createdAt)}
                    </div>
                    <div className="w-[10%]">
                      <Popconfirm
                        title="Delete session"
                        description="Are you sure to delete this sesssion?"
                        onConfirm={() => handleLogoutDevice(item.sessionToken)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button disabled={isPendingLogoutDevice}>
                          <FiTrash2 size={15} color="red" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full flex justify-end mt-1">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="px-2 rounded-md"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="me-1">
                <Popconfirm
                  title="Delete session"
                  description="Are you sure to delete all sesssion?"
                  onConfirm={handleLogoutAllDevices}
                  okText="Yes"
                  cancelText="No"
                >
                  <button
                    disabled={isPendingLogoutAllDevices}
                    type="submit"
                    className="px-2 py-1 bg-slate-500 rounded-sm text-white"
                  >
                    Delete All Session
                  </button>
                </Popconfirm>
              </div>
              <div className="me-1">
                <Popconfirm
                  title="Delete account"
                  description="Are you sure to delete your account?"
                  onConfirm={() => setIsDeleteAcc(true)}
                  okText="Yes"
                  cancelText="No"
                >
                  <button
                    disabled={isPendingDeleteAccount}
                    type="submit"
                    className="px-2 py-1 bg-red-500 rounded-sm text-white"
                  >
                    Delete Account
                  </button>
                </Popconfirm>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title="Confirm"
        open={isDeleteAcc}
        footer={false}
        onCancel={cancelConfrim}
      >
        <p>
          Please wirte <span className="text-black font-semibold">CONFIRM</span>{" "}
          to confirm delete.
        </p>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Write here"
        />
        <div className="w-full flex justify-end mt-2">
          <button
            onClick={() => confirmDelete()}
            disabled={isPendingChangePassword}
            type="submit"
            className="px-2 py-1 bg-red-500 rounded-sm text-white"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AccountComponent;
