import { memo, useEffect, useState } from "react";
import { AppModal } from "../../../../components/common/AppModal";
import { ModalContent } from "../../../../components/common/AppModal/ModalContent";
import { ModalHeader } from "../../../../components/common/AppModal/ModalHeader";
import { PrimaryButton } from "../../../../components/common/Button";
import { DateTimePicker } from "../../../../components/common/DateTimePicker";
import { disableWhitelist } from "../../../../services/blockchainService";
import moment from "moment";
import { Action } from "./demo-data";

const SalePublicModal = ({
  launchpadAddr,
  isOpen,
  onClose,
  onChangeLoading,
  onChangeAction,
  endOfWhitelistTime,
}: SalePublicModalProps) => {
  const [publicType, setPublicType] = useState(SALE_UPDATE_TYPE.public);
  const [dateTime, setDateTime] = useState(moment());
  const [isFetching, setIsFetching] = useState(false);

  const yesterday = moment().subtract(1, "day");

  const disablePastDt = (current: any) => {
    return current.isAfter(yesterday);
  };

  const handleChangePublicType = (type: number) => {
    setPublicType(type);
  };

  const handleChangeDateTime = (value: any) => {
    setDateTime(value);
  };

  const handleClickPublic = async () => {
    onChangeLoading(true);
    setIsFetching(true);
    let time = 0;

    if (publicType === SALE_UPDATE_TYPE.publicSpecific) {
      time = dateTime.unix();
    }
    await disableWhitelist(launchpadAddr, time);

    if (publicType === SALE_UPDATE_TYPE.publicSpecific) {
      onChangeAction(Action.Public);
    }
    onChangeLoading(false);
    setIsFetching(false);
    onClose();
  };

  useEffect(() => {
    if (Number(endOfWhitelistTime) > 0) {
      const newDate = moment(endOfWhitelistTime);
      setDateTime(newDate);
      setPublicType(SALE_UPDATE_TYPE.publicSpecific);
    }
  }, [endOfWhitelistTime]);

  return (
    <AppModal modalIsOpen={isOpen} closeModal={onClose}>
      <ModalHeader text="Change Status" onModalClose={onClose} />
      <ModalContent>
        <span>Change this pool to public</span>
        <div className="flex items-center justify-start gap-8 mt-2">
          <div className="cursor-pointer">
            <input
              checked={publicType === SALE_UPDATE_TYPE.public}
              id="public"
              type="radio"
              onChange={() => handleChangePublicType(SALE_UPDATE_TYPE.public)}
            />
            <label className="ml-2 cursor-pointer " htmlFor="public">
              Public now
            </label>
          </div>
          <div className="cursor-pointer">
            <input
              id="public_specific"
              checked={publicType === SALE_UPDATE_TYPE.publicSpecific}
              type="radio"
              onChange={() =>
                handleChangePublicType(SALE_UPDATE_TYPE.publicSpecific)
              }
            />
            <label className="ml-2 cursor-pointer " htmlFor="public_specific">
              Public with specific time
            </label>
          </div>
        </div>
        {publicType === SALE_UPDATE_TYPE.publicSpecific && (
          <div id="date_picker" className="mt-4">
            <span className=" block mb-2">Public sale start time</span>
            <DateTimePicker
              validDate={disablePastDt}
              onChange={handleChangeDateTime}
              value={dateTime}
              utc={true}
            />
            <span className="text-xs">
              Set the time that you want to open this pool to public
            </span>
          </div>
        )}
        <div className="flex items-center justify-center ">
          <PrimaryButton
            disabled={isFetching}
            onClick={handleClickPublic}
            className="mt-6 m-auto"
          >
            Public now
          </PrimaryButton>
        </div>
      </ModalContent>
    </AppModal>
  );
};

export default memo(SalePublicModal);

type SalePublicModalProps = {
  launchpadAddr?: string;
  endOfWhitelistTime: number;
  isOpen: boolean;
  onClose: () => void;
  onChangeLoading: (isLoading: boolean) => void;
  onChangeAction: (action: number) => void;
};

const SALE_UPDATE_TYPE = {
  public: 0,
  publicSpecific: 1,
};
