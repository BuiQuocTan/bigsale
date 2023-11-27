import React, { useEffect, useState } from "react";
import { Card } from "../../../../components/common/Card";
import { Link } from "react-router-dom";
import { LaunchPadCard } from "../../../../components/layout/LaunchComponent/LaunchPadCard";
import { ListsType } from "./demo-data";
import { Input, InputContainer } from "../../../../components/common/Inputs";
import { SecondaryButton } from "../../../../components/common/Button";
import { LaunchpadFilter } from "../../../../components/layout/LaunchComponent/LaunchpadFilter";
import { TabSelector } from "../../../../components/common/Tabs/TabSelector";
import { TabPanel, useTabs } from "../../../../components/common/Tabs";
import { NoData } from "../../../../components/layout/NoData";
import { LaunchPadLoader } from "../../../../components/common/CardLoader";
import { Pagination } from "../../../../components/common/Pagination";
import {
  getLaunchpadDetails,
  getConnectedWallet,
  connectMetamask,
} from "../../../../services/blockchainService";
import { getSaleStatus } from "../../../../utils";

interface FilterType {
  user?: string;
  launchPadType?: number;
  tokenSale?: string;
  status?: string;
}

const LaunchpadLists = () => {
  const [selectedTab, setSelectedTab] = useTabs(["allPools", "myPools"]);
  const [walletAddr, setWalletAddr] = useState("");
  //sample pagination data
  // const [paginatedList, setPaginatedList] = useState<ListsType[]>([]);
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const [totalPages, setTotalPages] = useState<number>(1)
  // const [totalItems, setTotalItems] = useState<number>(0)
  // const [tokenAddr, setTokenAddr] = useState('')

  // const [lists, setLists] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filteredTokenList, setFilteredTokenList] = useState<ListsType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [launchpadList, setLaunchpadList] = useState<any[]>([]);
  const [tokenAddr, setTokenAddr] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>({});

  const itemsPerPage = 2;

  const filterLaunchpads = async () => {
    if (selectedTab === "myPools" && !walletAddr) {
      const addr = await connectMetamask();
      setWalletAddr(addr);
    }
    const newFilter: FilterType = {};
    if (selectedTab === "myPools" && walletAddr) {
      newFilter.user = walletAddr.toLowerCase();
    }
    if (tokenAddr) {
      newFilter.tokenSale = tokenAddr.toLowerCase();
    }
    if (statusFilter) {
      newFilter.status = statusFilter;
    }
    setFilter(newFilter);
  };

  useEffect(() => {
    filterLaunchpads();
  }, [statusFilter, selectedTab, tokenAddr, currentPage]);

  useEffect(() => {
    const { user, tokenSale, status } = filter;
    handleListUpdate({ user, tokenSale, status }, currentPage, itemsPerPage);
  }, [filter, currentPage]);

  const handleListUpdate = async (
    filter?: {
      user?: string;
      launchPadType?: number;
      tokenSale?: string;
      status?: string;
    },
    page?: number | null,
    size?: number | null
  ) => {
    const { totalItems, launchpads, totalPages, currentPage } =
      await getLaunchpadDetails({ filter, page, size });
    if (!isLoaded) setIsLoaded(true);
    if (launchpads) {
      setCurrentPage(currentPage);
      setTotalPages(totalPages);
      setTotalItems(totalItems);
      setLaunchpadList(launchpads);
    }
  };

  const handleSetWalletAddr = async () => {
    const addr = await getConnectedWallet();
    setWalletAddr(addr);
  };

  useEffect(() => {
    handleSetWalletAddr();
    handleListUpdate({}, null, itemsPerPage);
    return () => {
      setWalletAddr("");
      setLaunchpadList([]);
    };
  }, []);

  return (
    <div>
      <div className="py-10">
        <h3 className="text-2xl md:text-3xl font-bold">Current PreSales 🔥</h3>
      </div>
      <nav className="flex mx-auto justify-center mb-8">
        <TabSelector
          isActive={selectedTab === "allPools"}
          onClick={() => setSelectedTab("allPools")}
        >
          All Pools
        </TabSelector>
        <TabSelector
          isActive={selectedTab === "myPools"}
          onClick={() => setSelectedTab("myPools")}
        >
          My Pools
        </TabSelector>
      </nav>
      <Card className="mb-10">
        <InputContainer className="flex flex-col md:flex-row md:space-x-2">
          <Link
            className="hidden md:block"
            to={`/app/launchpad/create/${tokenAddr}`}
          >
            <SecondaryButton>Create Pool</SecondaryButton>
          </Link>
          <Input
            type="text"
            placeholder="Enter Token Address"
            onChange={(event) => setTokenAddr(event.target.value)}
          />
        </InputContainer>
        <LaunchpadFilter selected={statusFilter} onSelect={setStatusFilter} />
      </Card>
      <div>
        <TabPanel hidden={selectedTab !== "allPools"}>
          {isLoaded ? (
            launchpadList?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {launchpadList?.map((item) => (
                  <Link
                    to={`/app/launchpad/lists/${item?.launchpadAddr}`}
                    key={item?.launchpadAddr}
                  >
                    <LaunchPadCard list={item} />
                  </Link>
                ))}
              </div>
            ) : (
              <NoData />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
              <LaunchPadLoader />
              <LaunchPadLoader />
              <LaunchPadLoader />
            </div>
          )}
          <Pagination
            currentPage={currentPage + 1} // The currently active page from the blockchain
            totalItems={totalItems} // Total amount of items in retrieved from the blockchain
            perPage={itemsPerPage} // Number of items per page
            totalPages={totalPages} // Total number of expected pages
            onPageClick={({ page }) => setCurrentPage(page - 1)}
          />
        </TabPanel>
        <TabPanel hidden={selectedTab !== "myPools"}>
          {isLoaded ? (
            launchpadList?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {launchpadList?.map((item) => (
                  <Link
                    to={`/app/launchpad/lists/${item?.launchpadAddr}`}
                    key={item?.launchpadAddr}
                  >
                    <LaunchPadCard list={item} />
                  </Link>
                ))}
              </div>
            ) : (
              <NoData />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
              <LaunchPadLoader />
              <LaunchPadLoader />
              <LaunchPadLoader />
            </div>
          )}
          <Pagination
            currentPage={currentPage + 1} // The currently active page from the blockchain
            totalItems={totalItems} // Total amount of items in retrieved from the blockchain
            perPage={itemsPerPage} // Number of items per page
            totalPages={totalPages} // Total number of expected pages
            onPageClick={({ page }) => setCurrentPage(page - 1)}
          />
        </TabPanel>
      </div>
    </div>
  );
};

export default LaunchpadLists;
