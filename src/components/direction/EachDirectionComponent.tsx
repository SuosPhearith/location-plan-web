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
import { Drawer, Input } from "antd";
import { FiUsers } from "react-icons/fi";
import { LuSearch } from "react-icons/lu";
import { IoChevronBackCircle } from "react-icons/io5";
import { LiaToggleOffSolid, LiaToggleOnSolid } from "react-icons/lia";
import { useRouter, useSearchParams } from "next/navigation";

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
  const { data, isLoading, isError } = useQuery<Route[]>({
    queryKey: ["eachDirections", id],
    queryFn: () => getEachDirection(id, order),
  });

  const searchParams = useSearchParams();
  const selectedQuery = searchParams.get("query");
  const selectedOrder = searchParams.get("order");
  const router = useRouter();
  const [visibleGroups, setVisibleGroups] = useState<number[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Route | null>(null);
  const [showLine, setShowLine] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    return <div>Something happened</div>;
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
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                Directions
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600 dark:bg-gray-800 dark:text-blue-400">
                {sumOfLatFromAllDirections(data)} Directions
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600 dark:bg-gray-800 dark:text-blue-400">
                {data.length} Routes
              </span>
              <button onClick={switchOrder}>
                {order === "order" ? (
                  <LiaToggleOnSolid size={30} title="Switch to NNA" />
                ) : (
                  <LiaToggleOffSolid size={30} title="Switch to order" />
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-x-2">
            <div
              title="Toggle Polylines"
              className={`flex cursor-pointer items-center justify-center rounded-md`}
              onClick={() => setShowLine(!showLine)}
            >
              <MdOutlineShowChart
                className={showLine ? "text-blue-900" : "text-red"}
                size={25}
              />
            </div>
            <div
              title="Show All"
              className="flex cursor-pointer items-center justify-center rounded-md "
              onClick={handleShowAllClick}
            >
              <FaRegEye className="text-blue-900" size={25} />
            </div>
            <div
              title="Hide All"
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
                placeholder="Search Routes"
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
                        Total directions:
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
        title="Route Detail"
        onClose={handleDrawerClose}
        open={isDrawerOpen}
      >
        {selectedGroup && (
          <div className="">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Route: {selectedGroup.route}
              </h3>
              <p className="text-gray-600">
                Total Directions: {selectedGroup.directions.length}
              </p>
            </div>
            <div>
              {selectedGroup.directions.map((item) => (
                <div key={item.id} className="mb-4 rounded-lg bg-gray-100 p-2">
                  <p className="text-gray-800">
                    <span className="font-medium">Name:</span> {item.name}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Status:</span> {item.status}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Type:</span> {item.type}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Latitude:</span> {item.lat}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Longitude:</span> {item.long}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </section>
  );
};

export default EachDirectionComponent;
