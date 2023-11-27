import React from "react";
import styled, { Interpolation } from "styled-components";
import { FormInputType } from "..";
import { PrimaryButton } from "../../../../../components/common/Button";
import { Card } from "../../../../../components/common/Card";
import {
  remainingTokenOptions,
  feeOptions,
  raisedTokenOptions,
} from "../../Lists/demo-data";

export interface ItemsContainerProps {
  style?: Interpolation<React.CSSProperties>;
}

const ItemsContainer = styled.div.attrs<ItemsContainerProps>(() => ({
  className: `grid grid-cols-2 w-full my-3 py-2 text-sm`,
}))<ItemsContainerProps>`
  ${({ style }) => style};
  border-bottom: 1px solid ${(props) => props.theme.colors.primaryText}30;
`;

export const DetailsSummary = ({
  moveToPrevious,
  submitFormData,
  onSignIn,
  formInput,
  isLoading,
  hasLogin,
}: {
  submitFormData?: () => void;
  onSignIn?: () => void;
  moveToPrevious?: () => void;
  formInput?: FormInputType;
  isLoading?: boolean;
  hasLogin?: boolean;
}) => {
  const handleClickButton = () => {
    console.log(hasLogin);
    if (hasLogin) {
      typeof submitFormData === "function" && submitFormData();
    } else {
      typeof onSignIn === "function" && onSignIn();
    }
  };

  return (
    <Card>
      {formInput?.totalSellingAmount && (
        <ItemsContainer>
          <p>Total Selling Amount</p>
          <p>{formInput?.totalSellingAmount}</p>
        </ItemsContainer>
      )}
      {formInput?.presaleRate && (
        <ItemsContainer>
          <p>Presale Rate</p>
          <p>{formInput?.presaleRate}</p>
        </ItemsContainer>
      )}
      {formInput?.listingRate && (
        <ItemsContainer>
          <p>Listing Rate</p>
          <p>{formInput?.listingRate}</p>
        </ItemsContainer>
      )}
      {formInput?.softCap && (
        <ItemsContainer>
          <p>Soft Cap</p>
          <p>{formInput?.softCap}</p>
        </ItemsContainer>
      )}
      {formInput?.hardCap && (
        <ItemsContainer>
          <p>Hard Cap</p>
          <p>{formInput?.hardCap}</p>
        </ItemsContainer>
      )}
      {formInput?.minBuy && (
        <ItemsContainer>
          <p>Minimum Buy</p>
          <p>{formInput?.minBuy}</p>
        </ItemsContainer>
      )}
      {formInput?.maxBuy && (
        <ItemsContainer>
          <p>Maximum Buy</p>
          <p>{formInput?.maxBuy}</p>
        </ItemsContainer>
      )}
      {formInput?.tokenPaymentAddr && (
        <ItemsContainer>
          <p>Currency Token</p>
          <p>
            {
              raisedTokenOptions.find(
                (option) => option.value === formInput?.tokenPaymentAddr
              )?.label
            }
          </p>
        </ItemsContainer>
      )}
      {formInput?.remainingTokenOption && (
        <ItemsContainer>
          <p>Unsold Tokens</p>
          <p>
            {
              remainingTokenOptions.find(
                (option) => option.value === formInput?.remainingTokenOption
              )?.label
            }
          </p>
        </ItemsContainer>
      )}
      {formInput?.feeOption && (
        <ItemsContainer>
          <p>Fee option</p>
          <p>
            {
              feeOptions.find((option) => option.value === formInput?.feeOption)
                ?.label
            }
          </p>
        </ItemsContainer>
      )}
      {/*
      {formInput?.liquidityPercent && (
        <ItemsContainer>
          <p>Liquidity Percentage</p>
          <p>{formInput?.liquidityPercent}%</p>
        </ItemsContainer>
      )}
      {formInput?.liquidityLockUp && (
        <ItemsContainer>
          <p>Liquidity Lockup</p>
          <p>{formInput?.liquidityLockUp} minutes</p>
        </ItemsContainer>
      )}
      */}
      {formInput?.startDate && (
        <ItemsContainer>
          <p>Start Date</p>
          <p>{formInput?.startDate?.toString()}</p>
        </ItemsContainer>
      )}
      {formInput?.endDate && (
        <ItemsContainer>
          <p>End Date</p>
          <p>{formInput?.endDate?.toString()}</p>
        </ItemsContainer>
      )}
      {formInput?.claimDate && (
        <ItemsContainer>
          <p>Last day for claiming token</p>
          <p>{formInput?.claimDate?.toString()}</p>
        </ItemsContainer>
      )}
      {formInput?.website && (
        <ItemsContainer>
          <p>Website</p>
          <p>{formInput?.website}</p>
        </ItemsContainer>
      )}
      {formInput?.youtube && (
        <ItemsContainer>
          <p>Youtube</p>
          <p>{formInput?.youtube}</p>
        </ItemsContainer>
      )}
      {formInput?.twitter && (
        <ItemsContainer>
          <p>Twitter</p>
          <p>{formInput?.twitter}</p>
        </ItemsContainer>
      )}
      {formInput?.facebook && (
        <ItemsContainer>
          <p>Facebook</p>
          <p>{formInput?.facebook}</p>
        </ItemsContainer>
      )}
      {formInput?.github && (
        <ItemsContainer>
          <p>Github</p>
          <p>{formInput?.github}</p>
        </ItemsContainer>
      )}
      {formInput?.reddit && (
        <ItemsContainer>
          <p>Reddit</p>
          <p>{formInput?.reddit}</p>
        </ItemsContainer>
      )}
      {formInput?.telegram && (
        <ItemsContainer>
          <p>Telegram</p>
          <p>{formInput?.telegram}</p>
        </ItemsContainer>
      )}
      {formInput?.discord && (
        <ItemsContainer>
          <p>Discord</p>
          <p>{formInput?.discord}</p>
        </ItemsContainer>
      )}
      {formInput?.description && (
        <ItemsContainer>
          <p>Project Description</p>
          <p>{formInput?.description}</p>
        </ItemsContainer>
      )}
      {formInput?.updates && (
        <ItemsContainer>
          <p>Participants Update</p>
          <p>{formInput?.updates}</p>
        </ItemsContainer>
      )}
      <ItemsContainer style={{ borderColor: "transparent", marginTop: "3rem" }}>
        <div>
          <PrimaryButton
            disabled={isLoading}
            size="small"
            onClick={moveToPrevious}
          >
            Previous
          </PrimaryButton>
        </div>
        <div className="text-right ml-2">
          <PrimaryButton
            disabled={isLoading}
            size="small"
            onClick={handleClickButton}
          >
            {hasLogin ? "Submit" : "Login"}
          </PrimaryButton>
        </div>
      </ItemsContainer>
    </Card>
  );
};
