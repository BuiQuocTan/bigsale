import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardSubHeader,
} from '../../../../components/common/Card';
import { IconButton } from '../../../../components/common/Button';
import { Alert } from '../../../../components/common/Alerts';
import { Spinner } from '../../../../components/common/Spinner';
import { Countdown } from '../../../../components/common/CountdownTimer';
import { RowHeader, RowItem } from '../../../../components/common/Inputs';
import { LaunchInfoText } from '../../../../components/layout/LaunchComponent';
import { formatTimeStamp } from '../../../../utils';
//import { tokenLocks } from './demo-lock-data';
import { getNormalTokensLock, unlockToken, getConnectedWallet } from '../../../../services/blockchainService'
import { shortenAddress } from '../../../../utils'
import { useNavigate } from "react-router-dom";

const LockDetails = () => {
  const params = useParams();
  const [lock, setLock] = useState<any>();
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddr, setWalletAddr] = useState('')
  const navigate = useNavigate()

  const handlePageLoad = async () => {
    if (params && params.id) {
      const tokenAddr = params.id;
      const currentLock = await getNormalTokensLock(tokenAddr);

      if (currentLock && currentLock[0]) {
        console.log('data', currentLock[0])
        setLock(currentLock[0]);
      } else {
        navigate('/app/token-lockers')
      }
    }
  }

  const handleUnlock = async (lockId: any) => {
    setIsLoading(true)
    const receipt = await unlockToken(lockId);
    if (receipt) {
      await Alert({
        title: 'Token Unlocked',
        iconColor: '#00BA38',
        confirmButtonText: 'OK'
      });

      await handlePageLoad()

    } else {
      await Alert({
        title: 'Failed to Unlock Token',
        icon: 'error',
        iconColor: '#f27474',
        confirmButtonText: 'I got it'
      });
    }
    setIsLoading(false)
  }

  const handleSetWalletAddr = async () => {
    const addr = await getConnectedWallet();
    setWalletAddr(addr)
  }

  useEffect(() => {
    handleSetWalletAddr()
  }, [])

  useEffect(() => {
    handlePageLoad()
  }, [params]);

  if (!lock) return (<div className="mt-28 flex justify-center"><Spinner /></div>);;

  return (
    <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 space-x-0 md:space-x-5 pt-20">
      {/* <Card
        style={{ height: 'fit-content' }}
        className="w-full md:w-1/3 md:sticky md:top-1"
      >
        <CardSubHeader>{lock.tokenSymbol} Records</CardSubHeader>
      </Card> */}
      <Card className="w-full md:w-2/3 mx-auto">
        <div className="mb-8">
          <h3 className="pb-3 font-bold">Lock Info</h3>
          <hr />
        </div>
        <div className="space-y-4">
          <LaunchInfoText>
            Token Address: <span>{lock.token}</span>
          </LaunchInfoText>
          <LaunchInfoText>
            Token Name: <span>{lock.name}</span>
          </LaunchInfoText>
          <LaunchInfoText>
            Token Symbol: <span>{lock.symbol}</span>
          </LaunchInfoText>
          <LaunchInfoText>
            Total Locked Amount: <span>{lock.totalLockedAmount}</span>
          </LaunchInfoText>
          <hr />
          <h3 className="pb-3 font-bold">Lock Records ({lock.lockedData.length})</h3>
          <RowHeader>Wallet Address</RowHeader><RowHeader>Amount</RowHeader><RowHeader>Lock Timer</RowHeader>
          {lock.lockedData && lock.lockedData.map((lockInfo: any) => (
            <div key={lockInfo.id}>
              <RowItem>{shortenAddress(lockInfo.owner)}</RowItem><RowItem>{lockInfo.lockedAmount}</RowItem><RowItem style={{ width: "40%" }}>
                <Countdown eventTime={formatTimeStamp(lockInfo.unlockDate)} />
              </RowItem><RowItem style={{ width: "10%" }}>
                {(walletAddr.toLowerCase() === lockInfo.owner.toLowerCase()) && <IconButton disabled={isLoading} onClick={() => handleUnlock(lockInfo.id)}>
                  <i className="las la-unlock"></i>
                </IconButton>}
              </RowItem>
            </div>
          ))}
          {/* <LaunchInfoText>
            Amount Locked: <span>{getBNFromToken(lock.amount, 18)}</span>
          </LaunchInfoText>
          <LaunchInfoText>
            Total Locks: <span>{lock.totalLocks}</span>
          </LaunchInfoText>
          <LaunchInfoText>
            Lock Timer: <Countdown eventTime={formatTimeStamp(lock.date)} />
    </LaunchInfoText>*/}
        </div>
      </Card>
    </div>
  );
};

export default LockDetails;
