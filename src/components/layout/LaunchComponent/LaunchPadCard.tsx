import React from 'react';
import { date } from 'yup';
import { LaunchInfoText } from '.';
import { ListsType, raisedTokenOptions } from '../../../pages/Dashboard/LaunchPad/Lists/demo-data';
import { Avatar } from '../../common/Avatar';
import { Badge } from '../../common/Badge';
import { SecondaryButton } from '../../common/Button';
import { Card, CardHeader, CardSubHeader, CardBody } from '../../common/Card';
import { Progress } from '../../common/Progress';
import Truncate from '../../common/Truncate';
import { LIST_SALE_STATUS } from '../../../utils/define'
import { getSaleStatus } from '../../../utils'


export const LaunchPadCard = ({ list }: { list: ListsType }) => {

  const status = getSaleStatus(list)
  return (
    <Card className="launch-card">
      <div className="flex justify-between items-center">
        <Avatar src={list.logo} />
        <Badge
          color={
            LIST_SALE_STATUS.find((el) => el.value === status)?.color || 'primary'
          }
        >
          {LIST_SALE_STATUS.find((el) => el.value === status)?.label}
        </Badge>
      </div>
      <div className="mt-3">
        <CardHeader>{list.name}</CardHeader>
        <CardSubHeader>${list.symbol}</CardSubHeader>
        <CardBody>
          {/*<Truncate
            className="opacity-80"
            text={list.description || 'No description available'}
            length={150}
        />*/}
          <div className="mt-10 space-y-2">
            {list.launchpadType === 1 && <LaunchInfoText>
              <span>Fairlaunch</span>
            </LaunchInfoText>}
            <LaunchInfoText>
              Soft Cap: <span>{list.softCap} {raisedTokenOptions.find(option => option.value === list?.tokenPaymentAddr)?.label}</span>
            </LaunchInfoText>
            {list.launchpadType === 0 ? <LaunchInfoText>
              Hard Cap: <span>{list.hardCap} {raisedTokenOptions.find(option => option.value === list?.tokenPaymentAddr)?.label}</span>
            </LaunchInfoText> : <LaunchInfoText>
              Total Selling Amount: <span>{list.totalSellingAmount}</span>
            </LaunchInfoText>}
            {list.launchpadType === 0 && <LaunchInfoText>
              Price: <span>1BNB = {list.presaleRate} {list.symbol}</span>
            </LaunchInfoText>}
            {/*<LaunchInfoText>
              Unlocks In: <span>{list.lockTime}</span>
        </LaunchInfoText>*/}
            <LaunchInfoText>
              Raised Amount: <span>{list.progress.toFixed(2)}%</span>
            </LaunchInfoText>
            <div className="pb-5">
              <Progress
                type="line"
                percent={list.progress}
                strokeWidth={2}
                trailWidth={2}
              />
              <div className="flex justify-between font-bold opacity-80 mt-2">
                <p>{list.totalDeposits}</p>
                <p>{list.launchpadType === 0 ? list.hardCap : list.softCap}</p>
              </div>
            </div>
            <hr />
            {/*
            <div className="pt-5">
              <SecondaryButton className="pointer-events-none" size="small">
                Requires KYC
              </SecondaryButton>
            </div>
      */}
          </div>
        </CardBody>
      </div>
    </Card>
  );
};
