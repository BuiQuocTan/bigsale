import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SecondaryButton } from '../../../../components/common/Button';
import { Card } from '../../../../components/common/Card';
import { TokenLockLoader } from '../../../../components/common/CardLoader';
import { InputContainer, Input } from '../../../../components/common/Inputs';
import { TabPanel, useTabs } from '../../../../components/common/Tabs';
import { TabSelector } from '../../../../components/common/Tabs/TabSelector';
import { NoData } from '../../../../components/layout/NoData';
import { TokenLockerCard } from '../../../../components/layout/TokenLockerComponent/LockerCard';
// import { tokenLocks } from './demo-lock-data';
import { getNormalTokensLock, getConnectedWallet, connectMetamask } from '../../../../services/blockchainService'

const TokenList = () => {
  const [selectedTab, setSelectedTab] = useTabs(['allLocks', 'myLocks']);
  const [tokenLocks, setTokenLocks] = useState<any[]>([]);
  const [userLocks, setUserLocks] = useState<any[]>([]);
  const [walletAddr, setWalletAddr] = useState('')

  const [isLoaded, setIsLoaded] = useState(false)

  const handleGetLockers = async () => {
    const list = await getNormalTokensLock()
    if (list) {
      list.reverse()
      setTokenLocks(list)
      if (selectedTab === 'myLocks' && !walletAddr) {
        const addr = await connectMetamask()
        setWalletAddr(addr)
      }
      setUserLocks(list.filter(li => li.lockedData.find((lock: any) => lock.owner.toLowerCase() === walletAddr.toLowerCase())))
    }
    if (!isLoaded) setIsLoaded(true)
    console.log({ list, walletAddr })
  }


  const handleSetWalletAddr = async () => {
    const addr = await getConnectedWallet();
    setWalletAddr(addr)
  }

  useEffect(() => {
    handleSetWalletAddr()
    return () => {
      setWalletAddr('');
    };
  }, [])

  useEffect(() => {
    handleGetLockers()
    return () => {
      setUserLocks([])
    };
  }, [walletAddr])

  return (
    <div>
      <div className="py-10">
        <h3 className="text-2xl md:text-3xl font-bold">Token Lockers 🔒</h3>
      </div>
      <nav className="flex mx-auto justify-center mb-8">
        <TabSelector
          isActive={selectedTab === 'allLocks'}
          onClick={() => setSelectedTab('allLocks')}
        >
          All
        </TabSelector>
        <TabSelector
          isActive={selectedTab === 'myLocks'}
          onClick={() => setSelectedTab('myLocks')}
        >
          My Lock
        </TabSelector>
      </nav>
      <Card className="mb-10">
        <InputContainer className="flex flex-col md:flex-row md:space-x-2">
          <Link className="hidden md:block" to="/app/token-lock">
            <SecondaryButton>Create Lock</SecondaryButton>
          </Link>
          <Input type="text" placeholder="Enter Token Address or Token Name" />
        </InputContainer>
      </Card>
      <div>
        <TabPanel hidden={selectedTab !== 'allLocks'}>
        {isLoaded ? tokenLocks?.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tokenLocks?.map((list) => (
              <Link to={`/app/token-lockers/${list.token}`} key={list.token}>
                <TokenLockerCard content={list} />
              </Link>
            ))}
          </div> : <NoData /> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
            <TokenLockLoader /><TokenLockLoader /><TokenLockLoader />
          </div>}
          {/* Token Locker loader component */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
            <TokenLockLoader />
          </div> */}
        </TabPanel>
        <TabPanel hidden={selectedTab !== 'myLocks'}>
          {isLoaded ? userLocks?.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {userLocks?.map((list) => (
              <Link to={`/app/token-lockers/${list.token}`} key={list.token}>
                <TokenLockerCard content={list} />
              </Link>
            ))}
          </div> : <NoData /> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-3">
            <TokenLockLoader /><TokenLockLoader /><TokenLockLoader />
          </div>}

        </TabPanel>
      </div >
    </div >
  );
};

export default TokenList;
