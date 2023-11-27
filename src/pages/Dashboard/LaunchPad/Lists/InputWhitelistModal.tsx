import { memo, useMemo, useState } from "react";
import { AppModal } from "../../../../components/common/AppModal";
import { ModalContent } from "../../../../components/common/AppModal/ModalContent";
import { ModalHeader } from "../../../../components/common/AppModal/ModalHeader";
import { PrimaryButton } from "../../../../components/common/Button";
import {
  addUserInWhitelist,
  removeUserInWhitelist,
} from "../../../../services/blockchainService";
import { ACTION_WHITELIST_OPTIONS } from "./Details";

const InputWhitelistModal = ({
  isOpen,
  onClose,
  type,
  launchpadAddr,
}: InputWhitelistModalProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [listUserInvalid, setListUserInvalid] = useState<string[]>([]);

  const isDisabledButton = useMemo(
    () => listUserInvalid.length > 0 || users.length <= 0 || isFetching,
    [listUserInvalid, isFetching, users]
  );

  const handleChangeUsers = (value: string) => {
    const listUser = value.split("\n");

    const regex = /[0-9A-Fa-f]{6}/g;

    const usersInValid = listUser.filter((item) => item && !item.match(regex));
    setListUserInvalid(usersInValid);
    setUsers(listUser);
  };

  const handClickAction = async () => {
    setIsFetching(true);
    if (type === ACTION_WHITELIST_OPTIONS.add) {
      await addUserInWhitelist(users, launchpadAddr);
    } else {
      await removeUserInWhitelist(users, launchpadAddr);
    }

    setIsFetching(false);
    onClose();
  };

  return (
    <AppModal modalIsOpen={isOpen} closeModal={onClose}>
      <ModalHeader
        text={
          type === ACTION_WHITELIST_OPTIONS.add
            ? "Add user to Whitelist"
            : "Remove user to Whitelist"
        }
        onModalClose={onClose}
      />
      <ModalContent>
        <div
          id="input_white_list"
          className="flex flex-col items-center justify-start p-4 pb-0 border-t"
        >
          <span className="block w-full my-2 ">Users</span>
          <textarea
            onChange={(event) => handleChangeUsers(event.target.value)}
            placeholder={`Insert address: separate with breaks line.
            Ex:
            0x34E7f6A4d0BB1fa7aFe548582c47Df337FC337E6
            0xd8Ebc66f0E3D638156D6F5eFAe9f43B1eBc113B1
            0x968136BB860D9534aF1563a7c7BdDa02B1A979C2`}
            className={`block w-full rounded border dark:bg-custom-dark-secondaryBackground bg-custom-light-secondaryBackground h-60 ${
              listUserInvalid.length > 0 &&
              "border-red-500 focus:border-red-500 focus:shadow-none"
            }`}
          />
        </div>
        {listUserInvalid.length > 0 && (
          <div className="flex pl-4 flex-col gap-1 text-red-500 text-sm">
            <span>User must be at least 42 characters and hex string</span>
            {listUserInvalid.map((item) => (
              <span>{item}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-center ">
          <PrimaryButton
            disabled={isDisabledButton}
            onClick={handClickAction}
            className="mt-4 m-auto"
          >
            {type === ACTION_WHITELIST_OPTIONS.add
              ? "Add users"
              : "Remove user"}
          </PrimaryButton>
        </div>
      </ModalContent>
    </AppModal>
  );
};

export default memo(InputWhitelistModal);

type InputWhitelistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: number;
  launchpadAddr?: string;
};
