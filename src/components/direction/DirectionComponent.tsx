"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, message, Modal, notification, Popconfirm } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaDownload, FaRegEdit, FaRoute } from "react-icons/fa";
import { FaRegTrashCan, FaRegEye } from "react-icons/fa6";
import {
  LuArrowLeft,
  LuArrowRight,
  LuPlusCircle,
  LuSearch,
} from "react-icons/lu";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import TableSeleton from "../../components/TableSeleton";
import { BsTruck } from "react-icons/bs";
import {
  createDirection,
  CreateNewDirection,
  deleteDirection,
  Direction,
  getAllDirection,
  ResponseAll,
} from "../../api/direction";
import {
  MdAltRoute,
  MdOutlineDirections,
  MdOutlineFileDownload,
} from "react-icons/md";
import { CiRoute } from "react-icons/ci";
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
  const [search, setSearch] = useState("");
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
      <section className="container p-5">
        {contextHolder}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-x-3">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                {t("direction")}
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600 dark:bg-gray-800 dark:text-blue-400">
                {data?.totalCount} Directions
              </span>
            </div>
          </div>
          <div
            onClick={showModal}
            title="Create"
            className="flex cursor-pointer justify-center rounded-md bg-primary p-1"
          >
            <LuPlusCircle color="white" size={20} />
          </div>
        </div>
        <div className="mt-3 md:flex md:items-center md:justify-between">
          <a
            href="/data.xlsx"
            download="sample-data.xlsx"
            title="sample data"
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
              placeholder="Search"
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
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-sm">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                        >
                          <button className="flex items-center gap-x-3 focus:outline-none">
                            NO.
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                        >
                          Group Code
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                        >
                          Note
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                        >
                          Total Directions
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                        >
                          Total Routes
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    {data?.data.map((item, index) => (
                      <tbody
                        className="divide-y divide-gray-200 bg-white hover:bg-slate-100 dark:divide-gray-700 dark:bg-gray-900"
                        key={item.id}
                      >
                        <tr>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="text-black dark:text-gray-200">
                              {(page - 1) * limit + index + 1}
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className=" text-green-800 dark:text-gray-200">
                              {item.group}
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="text-black dark:text-gray-200">
                              {item.note}
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex items-center text-black dark:text-gray-200">
                              <span className="me-2">
                                {item.totalDirections}
                              </span>{" "}
                              <MdOutlineDirections />
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex items-center text-black dark:text-gray-200">
                              <span className="me-2">{item.totalRoutes}</span>{" "}
                              <MdAltRoute />
                            </h4>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <h4 className="flex text-black dark:text-gray-200">
                              {!item?.file ? (
                                ""
                              ) : (
                                <a href={`${baseUrl}/${item.file}`}>
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
                                title="Delete"
                                description="Are you sure to delete?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDelete(item.id || 0)}
                              >
                                <FaRegTrashCan
                                  size={18}
                                  color="red"
                                  className="mx-1 cursor-pointer"
                                  title="Delete item"
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
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page
            <span className="font-medium text-black dark:text-gray-100">
              {page} of {data?.totalPages}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-x-4 sm:mt-0">
            <Link
              href={`?page=${page > 1 ? page - 1 : 1}&limit=${limit}`}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-[8px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
            >
              <LuArrowLeft size={20} />
              <span>Previous</span>
            </Link>
            <Link
              href={`?page=${page < (data?.totalPages || 1) ? page + 1 : page}&limit=${limit}`}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-[8px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
            >
              <span>Next</span>
              <LuArrowRight size={20} />
            </Link>
            <select
              name="warehouse"
              value={limit}
              onChange={handlePageSizeChange}
              className="flex w-1/2 items-center justify-center gap-x-2 rounded-md border bg-white px-5 py-[5px] text-sm capitalize text-black transition-colors duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
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
          title={"Create"}
          className="font-satoshi"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          maskClosable={false}
          footer={null} // Set footer to null if you don't want to display anything there
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-2 text-slate-600">
              Note<span className="text-red">*</span>
            </div>
            <input
              {...register("note", { required: true, minLength: 3 })}
              type="text"
              placeholder="Note"
              className="ps-5 w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-2 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2"
            />
            {errors.note && (
              <span className="text-sm text-red-800">
                Please input a valid note.
              </span>
            )}
            <div className="mt-2 text-slate-600">
              File<span className="text-red">*</span>
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
                      "Please upload a valid Excel file."
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
                Cancel
              </div>
              <button
                type="submit"
                className="me-1 mt-5 rounded-md bg-primary px-4 py-2 text-white"
                disabled={isPendingCreate}
              >
                {isPendingCreate ? "Submitting..." : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      </section>
    </LayoutComponent>
  );
};

export default DirectionComponent;
