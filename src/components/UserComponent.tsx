"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image,
  Input,
  message,
  Modal,
  notification,
  Popconfirm,
  Switch,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import {
  LuArrowLeft,
  LuArrowRight,
  LuPlusCircle,
  LuSearch,
} from "react-icons/lu";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import TableSeleton from "../components/TableSeleton";
import { MdLockOpen } from "react-icons/md";
import { RiFileExcel2Line } from "react-icons/ri";
import LayoutComponent from "./LayoutComponent";
import { useTranslations } from "next-intl";
import {
  CreateNewUser,
  createUser,
  deleteUser,
  getAllUser,
  resetPasswordUser,
  ResponseAll,
  toggleActive,
} from "@/api/user";
// import Image from "next/image";
const imageUrl = process.env.NEXT_PUBLIC_IMG_URL;
interface DirectionProps {
  locale: string;
}

const UserComponent: React.FC<DirectionProps> = ({ locale }) => {
  const t = useTranslations("UserPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPage = Number(searchParams.get("page")) || 1;
  const selectedLimit = Number(searchParams.get("limit")) || 10;
  const selectedQuery = searchParams.get("query") || "";
  const [page, setPage] = useState(selectedPage);
  const [limit, setLimit] = useState(selectedLimit);
  const [query, setQuery] = useState(selectedQuery);
  const queryClient = useQueryClient();
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (
    message: string = "Default",
    description: string = "Successfully"
  ) => {
    api.success({
      message,
      description,
      duration: 3,
      placement: "bottomLeft",
    });
  };

  // create
  const { mutateAsync: createMutaion, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        message.success("Created successfully");
        handleCancel();
      },
      onError: (error: any) => {
        message.error(error);
      },
    });
  const onSubmit: SubmitHandler<CreateNewUser> = async (data) => {
    await createMutaion(data);
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateNewUser>();
  // end create

  //modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalReset, setIsModalReset] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [resetId, setResetId] = useState<number>();
  const handleCancelReset = () => {
    setIsModalReset(false);
    setPasswordValue("");
    setResetId(undefined);
  };

  const { mutateAsync: resetMutaion } = useMutation({
    mutationFn: resetPasswordUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Reset successfully");
      handleCancelReset();
    },
    onError: (error: any) => {
      message.error(error);
    },
  });

  const resetPassword = async () => {
    if (passwordValue.length < 6) {
      return message.error(t("password_validate"));
    }
    await resetMutaion({ id: resetId || 0, newPassword: passwordValue });
  };

  const handleResetPassword = (id: number) => {
    setIsModalReset(true);
    setResetId(id);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    reset();
    setIsModalOpen(false);
  };
  // end modal

  // delete
  const { mutateAsync: deleteMutate, isPending: isPendingDelete } = useMutation(
    {
      mutationFn: deleteUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        message.success("Deleted successfully");
      },
      onError: (error: any) => {
        message.error(error);
      },
    }
  );
  const handleDelete = async (id: number) => {
    await deleteMutate(id);
  };
  // end delete

  // toggle
  const { mutateAsync: toggleMutate, isPending: isPendingToggle } = useMutation(
    {
      mutationFn: toggleActive,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (error: any) => {
        message.error(error);
      },
    }
  );
  const handleToggleActive = async (id: number) => {
    await toggleMutate(id);
  };
  // end toggle

  //fectch
  const { data, isLoading, isError } = useQuery<ResponseAll>({
    queryKey: ["users", page, limit, query],
    queryFn: () => getAllUser(page, limit, query),
  });

  useEffect(() => {
    setPage(selectedPage);
    setLimit(selectedLimit);
  }, [selectedPage, selectedLimit]);

  if (isError) {
    return <div>Something happened</div>;
  }

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newSize = Number(event.target.value);
    setLimit(newSize);
    router.push(`?page=1&limit=${newSize}`);
  };
  const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
  };
  // end fectch

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
    <LayoutComponent>
      <section className="container p-5">
        {contextHolder}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-x-3">
              <h2 className="text-lg font-medium text-gray-800">{t("User")}</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                {data?.totalCount} {t("User")}
              </span>
            </div>
          </div>
          <div
            onClick={showModal}
            title={t("create")}
            className="flex cursor-pointer justify-center rounded-md bg-primary p-1"
          >
            <LuPlusCircle color="white" size={20} />
          </div>
        </div>
        <div className="mt-3 md:flex md:items-center md:justify-between">
          <a
            href="/data.xlsx"
            download="sample-data.xlsx"
            title={t("sameple_data")}
            className="flex cursor-pointer justify-center rounded-md bg-primary p-1"
          >
            <RiFileExcel2Line color="white" size={20} />
          </a>
          <div className="flex flex-col">
            <Input
              className="w-[250px] max-[770px]:w-full"
              prefix={<LuSearch />}
              onChange={handleChangeSearch}
              value={query}
              type="text"
              placeholder={t("search")}
            />
          </div>
        </div>
        {isLoading ? (
          <div>
            <TableSeleton />
          </div>
        ) : (
          <div className="mt-3 flex flex-col">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 md:rounded-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 rtl:text-right"
                        >
                          <button className="flex items-center gap-x-3 focus:outline-none">
                            {t("no")}
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 rtl:text-right"
                        >
                          <button className="flex items-center gap-x-3 focus:outline-none">
                            {t("avatar")}
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 rtl:text-right"
                        >
                          {t("name")}
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 rtl:text-right"
                        >
                          {t("email")}
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 rtl:text-right"
                        >
                          {t("status")}
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 rtl:text-right"
                        >
                          {t("last_update")}
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 rtl:text-right"
                        >
                          {t("action")}
                        </th>
                      </tr>
                    </thead>
                    {data?.data.map((item, index) => (
                      <tbody
                        className="divide-y divide-gray-200 bg-white hover:bg-slate-100 "
                        key={item.id}
                      >
                        <tr>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="text-black ">
                              {(page - 1) * limit + index + 1}
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 text-sm">
                            <div className="h-[40px] w-[40px] rounded-full bg-slate-300">
                              {item.avatar ? (
                                <Image
                                  src={`${imageUrl}${item.avatar}`}
                                  alt="profile"
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={`/user.png`}
                                  alt="profile"
                                  className="h-[40px] w-[40px] rounded-full object-cover"
                                />
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className=" text-green-800 ">{item.name}</h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="text-black ">{item.email}</h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex items-center text-black ">
                              <Switch
                                disabled={isPendingToggle}
                                checked={item.status}
                                size="small"
                                onClick={() => handleToggleActive(item.id)}
                              />
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex items-center text-black ">
                              {convertToDateTime(item.updatedAt)}
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex text-black ">
                              <Popconfirm
                                disabled={isPendingDelete}
                                title={t("delete")}
                                description={t("confirm_delete")}
                                okText={t("Yes")}
                                cancelText={t("No")}
                                onConfirm={() => handleDelete(item.id || 0)}
                              >
                                <FaRegTrashCan
                                  size={18}
                                  color="red"
                                  className="mx-1 cursor-pointer"
                                  title={t("delete")}
                                />
                              </Popconfirm>
                              <MdLockOpen
                                onClick={() => handleResetPassword(item.id)}
                                size={20}
                                color="blue"
                                className="mx-1 cursor-pointer"
                                title={t("reset")}
                              />
                            </h4>
                          </td>
                        </tr>
                      </tbody>
                    ))}
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 sm:flex sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            {t("page")}
            <span className="font-medium text-black ">
              {page} {t("of")} {data?.totalPages}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-x-4 sm:mt-0">
            <Link
              href={`?page=${page > 1 ? page - 1 : 1}&limit=${limit}`}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-[8px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 sm:w-auto"
            >
              <LuArrowLeft size={20} />
              <span>{t("previous")}</span>
            </Link>
            <Link
              href={`?page=${page < (data?.totalPages || 1) ? page + 1 : page}&limit=${limit}`}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-[8px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 sm:w-auto"
            >
              <span>{t("next")}</span>
              <LuArrowRight size={20} />
            </Link>
            <select
              name="warehouse"
              value={limit}
              onChange={handlePageSizeChange}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-[5px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 sm:w-auto"
              id="warehouse"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <Modal
          title={t("create")}
          className="font-satoshi"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          maskClosable={false}
          footer={null} // Set footer to null if you don't want to display anything there
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-2 text-slate-600">
              {t("name")}
              <span className="text-red-800">*</span>
            </div>
            <input
              {...register("name", { required: true, minLength: 3 })}
              type="text"
              placeholder={t("name")}
              className="ps-5 w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-2 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
            {errors.name && (
              <span className="text-sm text-red-800">{t("name_validate")}</span>
            )}
            <div className="mt-2 text-slate-600">
              {t("email")}
              <span className="text-red-800">*</span>
            </div>
            <input
              {...register("email", { required: true })}
              type="text"
              placeholder={t("email")}
              className="ps-5 w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-2 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
            {errors.email && (
              <span className="text-sm text-red-800">
                {t("email_validate")}
              </span>
            )}
            <div className="mt-2 text-slate-600">
              {t("password")}
              <span className="text-red-800">*</span>
            </div>
            <input
              {...register("password", { required: true, minLength: 6 })}
              type="text"
              placeholder={t("password")}
              className="ps-5 w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-2 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
            {errors.password && (
              <span className="text-sm text-red-800">
                {t("password_validate")}
              </span>
            )}
            <div className="flex w-full items-center justify-end">
              <div
                onClick={handleCancel}
                className="me-1 mt-5 cursor-pointer rounded-md bg-blue-400 px-4 py-2 text-white"
              >
                {t("cancel")}
              </div>
              <button
                type="submit"
                className="me-1 mt-5 rounded-md bg-primary px-4 py-2 text-white"
                disabled={isPendingCreate}
              >
                {isPendingCreate ? "Submitting..." : t("create")}
              </button>
            </div>
          </form>
        </Modal>
        <Modal
          title={t("reset_password")}
          open={isModalReset}
          onCancel={handleCancelReset}
          footer={false}
          maskClosable={false}
        >
          <div className="mt-2 text-slate-600">
            {t("new_password")}
            <span className="text-red-800">*</span>
          </div>
          <Input.Password
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            placeholder={t("new_password")}
            className="ps-5 w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-2 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
          />
          <div className="flex w-full items-center justify-end">
            <div
              onClick={handleCancelReset}
              className="me-1 mt-5 cursor-pointer rounded-md bg-blue-400 px-4 py-2 text-white"
            >
              {t("cancel")}
            </div>
            <button
              type="submit"
              onClick={resetPassword}
              className="me-1 mt-5 rounded-md bg-primary px-4 py-2 text-white"
            >
              {t("reset")}
            </button>
          </div>
        </Modal>
      </section>
    </LayoutComponent>
  );
};

export default UserComponent;
