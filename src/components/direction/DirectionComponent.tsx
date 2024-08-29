"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, message, Modal, notification, Popconfirm } from "antd";
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
import TableSeleton from "../../components/TableSeleton";
import {
  createDirection,
  CreateNewDirection,
  deleteDirection,
  getAllDirection,
  ResponseAll,
} from "../../api/direction";
import {
  MdAltRoute,
  MdOutlineDirections,
  MdOutlineFileDownload,
} from "react-icons/md";
import { TbMapPin2 } from "react-icons/tb";
import { RiFileExcel2Line } from "react-icons/ri";
import LayoutComponent from "../LayoutComponent";
import { useTranslations } from "next-intl";
const baseUrl = process.env.NEXT_PUBLIC_IMG_URL;
interface DirectionProps {
  locale: string;
}

const DirectionComponent: React.FC<DirectionProps> = ({ locale }) => {
  const t = useTranslations("HomePage");
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
      mutationFn: createDirection,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["directions"] });
        // message.success("Direction created successfully");
        openNotification("Create Direction", "Direction Created successfully");
        handleCancel();
      },
      onError: (error: any) => {
        message.error(error);
      },
    });
  const onSubmit: SubmitHandler<CreateNewDirection> = async (data) => {
    await createMutaion(data);
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateNewDirection>();
  // end create

  //modal
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      mutationFn: deleteDirection,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["directions"] });
        // message.success("Case deleted successfully");
        openNotification("Delete Direction", "Direction Deleted successfully");
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

  //fectch
  const { data, isLoading, isError } = useQuery<ResponseAll>({
    queryKey: ["directions", page, limit, query],
    queryFn: () => getAllDirection(page, limit, query),
  });

  useEffect(() => {
    setPage(selectedPage);
    setLimit(selectedLimit);
  }, [selectedPage, selectedLimit]);

  // if (isLoading) {
  //   return <Skeleton />;
  // }
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

  return (
    <LayoutComponent>
      <section className="w-full p-5 max-[500px]:px-0 max-[500px]:py-2">
        {contextHolder}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-x-3">
              <h2 className="text-lg font-medium text-gray-800">
                {t("direction")}
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                {data?.totalCount} {t("directions")}
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
        <div className="mt-3 flex justify-between items-center">
          <a
            href="/data.xlsx"
            download="sample-data.xlsx"
            title={t("sameple_data")}
            className="flex cursor-pointer justify-center items-center rounded-md bg-primary p-1"
          >
            <RiFileExcel2Line color="white" size={20} />
          </a>
          <div className="flex flex-col">
            <Input
              className="w-[250px] max-[500px]:w-full"
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
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500  rtl:text-right"
                        >
                          <button className="flex items-center gap-x-3 focus:outline-none">
                            {t("no")}
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500  rtl:text-right"
                        >
                          {t("code")}
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500  rtl:text-right"
                        >
                          {t("note")}
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500  rtl:text-right"
                        >
                          {t("total_directions")}
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500  rtl:text-right"
                        >
                          {t("total_routes")}
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500  rtl:text-right"
                        >
                          {t("action")}
                        </th>
                      </tr>
                    </thead>
                    {data?.data.map((item, index) => (
                      <tbody
                        className="divide-y divide-gray-200 bg-white hover:bg-slate-100"
                        key={item.id}
                      >
                        <tr>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="text-black ">
                              {(page - 1) * limit + index + 1}
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className=" text-green-800 ">{item.group}</h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="text-black ">{item.note}</h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex items-center text-black ">
                              <span className="me-2">
                                {item.totalDirections}
                              </span>{" "}
                              <MdOutlineDirections />
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex items-center text-black ">
                              <span className="me-2">{item.totalRoutes}</span>{" "}
                              <MdAltRoute />
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex text-black ">
                              {!item?.file ? (
                                ""
                              ) : (
                                <a href={`${baseUrl}${item.file}`}>
                                  <MdOutlineFileDownload size={18} />
                                </a>
                              )}
                              <Link href={`${locale}/${item.id}`}>
                                <TbMapPin2
                                  size={18}
                                  color="blue"
                                  className="mx-1 cursor-pointer"
                                  title="Go to map"
                                />
                              </Link>
                              <Popconfirm
                                title={t("delete")}
                                description={t("confirm_delete")}
                                okText={t("yes")}
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
          <div className="text-sm text-gray-500 ">
            {t("page")}
            <span className="font-medium text-black">
              {page} {t("of")} {data?.totalPages}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-x-4 sm:mt-0">
            <Link
              href={`?page=${page > 1 ? page - 1 : 1}&limit=${limit}`}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-3 py-[8px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 sm:w-auto"
            >
              <LuArrowLeft size={20} />
              <span>{t("previous")}</span>
            </Link>
            <Link
              href={`?page=${page < (data?.totalPages || 1) ? page + 1 : page}&limit=${limit}`}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-3 py-[8px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 sm:w-auto"
            >
              <span>{t("next")}</span>
              <LuArrowRight size={20} />
            </Link>
            <select
              name="warehouse"
              value={limit}
              onChange={handlePageSizeChange}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-3 py-[5px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 sm:w-auto"
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
              {t("note")}
              <span className="text-red-800">*</span>
            </div>
            <input
              {...register("note", { required: true, minLength: 3 })}
              type="text"
              placeholder={t("note")}
              className="ps-5 w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-2 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
            {errors.note && (
              <span className="text-sm text-red-800">{t("note_validate")}</span>
            )}
            <div className="mt-2 text-slate-600">
              {t("file")}
              <span className="text-red-800">*</span>
            </div>
            <input
              {...register("file", {
                required: true,
                validate: {
                  // Custom validation function
                  isExcel: (value) => {
                    const allowedExtensions = [
                      "application/vnd.ms-excel",
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    ];
                    return (
                      (value &&
                        value[0] &&
                        allowedExtensions.includes(value[0].type)) ||
                      t("file_validate")
                    );
                  },
                },
              })}
              type="file"
              className="ps-5 w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-2 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
            {errors.file && (
              <span className="text-sm text-red-800">
                {errors.file.message?.toString()}
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
      </section>
    </LayoutComponent>
  );
};

export default DirectionComponent;
