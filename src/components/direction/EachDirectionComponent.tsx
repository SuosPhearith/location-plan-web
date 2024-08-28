"use client";
import {
  getEachDirection,
  Route,
  sumOfLatFromAllDirections,
} from "../../api/eachDirection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { FaListUl, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Skeleton from "../../components/Skeleton";
import dynamic from "next/dynamic";
import { MdAltRoute, MdOutlineShowChart } from "react-icons/md";
import Link from "next/link";
import { Drawer, Input, Switch } from "antd";
import { LuSearch } from "react-icons/lu";
import { IoChevronBackCircle } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";
import LayoutComponent from "../LayoutComponent";
import { useTranslations } from "next-intl";
import NotFoundComponent from "../NotFoundComponent";

// Dynamically import Map component with no SSR
const Map = dynamic(() => import("../Map"), {
  ssr: false,
});
// Dynamically import Map component with no SSR
const MapWithoutPolyline = dynamic(() => import("../MapWithoutPolyline"), {
  ssr: false,
});

interface DirectionProps {
  id: number;
}

const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A6",
  "#FF8C33",
  "#8C33FF",
  "#33FFF6",
  "#FF3367",
  "#F6FF33",
  "#33FF8C",
];

const EachDirectionComponent: React.FC<DirectionProps> = ({ id }) => {
  const { data, isLoading, isError, error } = useQuery<Route[]>({
    queryKey: ["eachDirections", id],
    queryFn: () => getEachDirection(id, order),
  });
  const t = useTranslations("MapPage");
  const searchParams = useSearchParams();
  const selectedQuery = searchParams.get("query");
  const selectedOrder = searchParams.get("order");
  const router = useRouter();
  const [visibleGroups, setVisibleGroups] = useState<number[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Route | null>(null);
  const [showLine, setShowLine] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState(selectedOrder || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      setVisibleGroups(data.map((_, index) => index));
    }
  }, [data]);

  useEffect(() => {
    if (selectedQuery) {
      setSearchQuery(selectedQuery);
    }
  }, [selectedQuery]);

  const handleEyeClick = (index: number) => {
    setVisibleGroups((prevVisibleGroups) =>
      prevVisibleGroups.includes(index)
        ? prevVisibleGroups.filter((i) => i !== index)
        : [...prevVisibleGroups, index]
    );
  };

  const handleShowAllClick = () => {
    setVisibleGroups(data ? data.map((_, index) => index) : []);
  };

  const handleHideAllClick = () => {
    setVisibleGroups([]);
  };

  const handleDrawerOpen = (group: Route) => {
    setSelectedGroup(group);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedGroup(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    router.replace(window.location.pathname);
  };

  const filteredData = data?.filter((route) =>
    route.route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markerGroups = filteredData?.map((group) =>
    group.directions.map((direction) => ({
      position: [direction.lat, direction.long],
      popupText: direction,
    }))
  );

  if (isLoading) {
    return <Skeleton />;
  }

  if (isError) {
    // Convert the error object to a string
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Convert both the errorMessage and the comparison strings to lowercase
    const lowerCaseErrorMessage = errorMessage.toLowerCase();
    const notFoundMessage = "Not Found".toLowerCase();
    const validationFailedMessage =
      "Validation failed (numeric string is expected)".toLowerCase();

    // Compare the strings in a case-insensitive manner
    if (
      lowerCaseErrorMessage === validationFailedMessage ||
      lowerCaseErrorMessage === notFoundMessage
    ) {
      return <NotFoundComponent />;
    }

    return <div>{errorMessage} hhh</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const visibleMarkerGroups: any = markerGroups?.filter((_, index) =>
    visibleGroups.includes(index)
  );

  const switchOrder = () => {
    // Get the current URL
    const url = new URL(window.location.href);

    // Get the current value of the 'order' query parameter
    const currentOrder = url.searchParams.get("order");

    // Toggle the 'order' query parameter
    if (currentOrder === "order") {
      url.searchParams.set("order", "");
    } else {
      url.searchParams.set("order", "order");
    }

    // Update the URL in the browser without reloading the page
    window.history.pushState({}, "", url);

    // Invalidate the query to refetch data
    queryClient.invalidateQueries({ queryKey: ["eachDirections"] });

    // Reload the page
    window.location.reload();
  };

  return (
    <LayoutComponent>
      <section className="">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-x-3">
                <Link href={"/"}>
                  <IoChevronBackCircle
                    color="blue"
                    className="cursor-pointer"
                    size={30}
                  />
                </Link>
                <h2 className="text-lg font-medium text-gray-800">
                  {t("directions")}
                </h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                  {sumOfLatFromAllDirections(data)} {t("directions")}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                  {data.length} {t("routes")}
                </span>
                <Switch
                  checked={order !== "order"}
                  onClick={switchOrder}
                  title="NNA"
                />
              </div>
            </div>
            <div className="flex gap-x-2">
              <div
                title={t("polyline")}
                className={`flex cursor-pointer items-center justify-center rounded-md`}
                onClick={() => setShowLine(!showLine)}
              >
                <MdOutlineShowChart
                  className={showLine ? "text-blue-900" : "text-red"}
                  size={25}
                />
              </div>
              <div
                title={t("show_all")}
                className="flex cursor-pointer items-center justify-center rounded-md "
                onClick={handleShowAllClick}
              >
                <FaRegEye className="text-blue-900" size={25} />
              </div>
              <div
                title={t("hide_all")}
                className="flex cursor-pointer items-center justify-center rounded-md "
                onClick={handleHideAllClick}
              >
                <FaRegEyeSlash className="text-blue-900" size={25} />
              </div>
              <div>
                <Input
                  className="h-full w-[250px] max-[770px]:w-full"
                  prefix={<LuSearch />}
                  onChange={handleSearchChange}
                  value={searchQuery}
                  type="text"
                  placeholder={t("search_route")}
                />
              </div>
            </div>
          </div>

          <div className="mt-2 flex justify-between max-[700px]:flex-col">
            <div className="h-[80vh] w-1/5 overflow-y-auto p-1 pe-3 max-[700px]:flex max-[700px]:h-[100px] max-[700px]:w-full max-[700px]:overflow-x-auto max-[700px]:overflow-y-hidden">
              {filteredData?.map((item, index) => (
                <div
                  key={item.route}
                  className="mx-auto mb-2 max-w-sm overflow-hidden bg-slate-100 max-[700px]:m-1 max-[700px]:w-[300px] max-[700px]:min-w-[200px] sm:rounded-md border border-1"
                >
                  <div className="">
                    <div className="px-2 py-2 sm:px-3">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-lg font-medium leading-6 text-gray-900">
                          <span className="me-1">
                            <MdAltRoute size={20} />
                          </span>{" "}
                          {item.route}
                        </h3>
                        <FaListUl
                          size={18}
                          className="cursor-pointer text-green-700"
                          onClick={() => handleDrawerOpen(item)}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">
                          {t("total_directions")}:
                          <span className="ms-1 text-green-600">
                            {item.directions.length}
                          </span>
                        </p>
                        {visibleGroups.includes(index) ? (
                          <FaRegEye
                            color="blue"
                            size={20}
                            className="cursor-pointer"
                            onClick={() => handleEyeClick(index)}
                          />
                        ) : (
                          <FaRegEyeSlash
                            color="blue"
                            size={20}
                            className="cursor-pointer"
                            onClick={() => handleEyeClick(index)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-4/5 p-1 max-[700px]:h-[700px] max-[700px]:w-full">
              {showLine ? (
                <Map markerGroups={visibleMarkerGroups || []} colors={colors} />
              ) : (
                <MapWithoutPolyline
                  markerGroups={visibleMarkerGroups || []}
                  colors={colors}
                />
              )}
            </div>
          </div>
        </div>

        <Drawer
          title={t("route_detail")}
          onClose={handleDrawerClose}
          open={isDrawerOpen}
        >
          {selectedGroup && (
            <div className="">
              <div className="mb-6">
                <h3 className="text-xl text-gray-800">
                  {t("route")}: {selectedGroup.route}
                </h3>
                <p className="text-gray-600">
                  {t("total_directions")}: {selectedGroup.directions.length}
                </p>
              </div>
              <div>
                {selectedGroup.directions.map((item) => (
                  <div
                    key={item.id}
                    className="mb-4 rounded-lg bg-gray-100 p-2"
                  >
                    <p className="text-gray-800">
                      <span className="font-medium">{t("name")}:</span>{" "}
                      {item.name}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">{t("status")}:</span>{" "}
                      {item.status}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">{t("type")}:</span>{" "}
                      {item.type}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Latitude:</span> {item.lat}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Longitude:</span>{" "}
                      {item.long}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Drawer>
      </section>
    </LayoutComponent>
  );
};

export default EachDirectionComponent;
