import React, { useState } from "react";
import { Card } from "../../../../../components/common/Card";
import {
  Input,
  InputContainer,
  InputError,
  InputHint,
  Label,
} from "../../../../../components/common/Inputs";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { PrimaryButton } from "../../../../../components/common/Button";
import AppSelect, {
  IOptions,
} from "../../../../../components/common/AppSelect";
import { DateTimePicker } from "../../../../../components/common/DateTimePicker";
import {
  remainingTokenOptions,
  feeOptions,
  raisedTokenOptions,
} from "../../Lists/demo-data";

const targetDexOptionsList: IOptions[] = [
  {
    label: "BakerySwap",
    value: "BakerySwap",
  },
  {
    label: "PancakeSwap",
    value: "PancakeSwap",
  },
];

const validationSchema = Yup.object().shape({
  // remainingToken: Yup.string().required('Method for handling remaining tokens is required'),
  presaleRate: Yup.number().required("Presale rate is required"),
  softCap: Yup.string().required("Softcap is required"),
  hardCap: Yup.string().required("hardCap is required"),
  minBuy: Yup.string().required("Minimum buy limit is required"),
  maxBuy: Yup.string().required("Maximum buy limit is required"),
  tokenPaymentAddr: Yup.string().required("Currency is required"),
  // tokenPaymentFee: Yup.string().required('TokenPaymentFee is required'),
  // tokenSaleFee: Yup.string().required('TokenSaleFee is required'),
  // targetExchange: Yup.string().required('Select an exchange.'),
  // liquidityPercent: Yup.string().required('Liquidity percentage is required.'),
  // listingRate: Yup.string().required('Listing rate is required.'),
  /*liquidityLockUp: Yup.number()
    .required('Lockup must be greater than 5 minutes.')
    .min(5, 'Lockup must be greater than 5 minutes'),*/
  startDate: Yup.date()
    .required("Start date is required.")
    .min(new Date(), "Start time cannot be in the past"),
  endDate: Yup.date()
    .required("End date is required.")
    .min(Yup.ref("startDate"), "End date can't be before start date"),
  claimDate: Yup.date()
    .required("Claim date is required.")
    .min(Yup.ref("endDate"), "Claim date can't be before end date"),
});
const formOptions = { resolver: yupResolver(validationSchema) };

export const LaunchInfo = ({
  moveToNext,
  moveToPrevious,
  sendFormData,
}: {
  moveToNext: () => void;
  moveToPrevious: () => void;
  sendFormData: (form: any) => void;
}) => {
  const [selectedExchange, setSelectedExchange] = useState<IOptions>();
  const [selectedCurrency, setSelectedCurrency] = useState(
    raisedTokenOptions[0].value
  );
  const { register, handleSubmit, setError, formState, control, getValues } =
    useForm(formOptions);
  const { errors } = formState;

  const handleForm: SubmitHandler<any> = async (value) => {
    sendFormData(value);
    moveToNext();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(handleForm)}>
        <InputContainer>
          <Label htmlFor="presaleRate">Presale Rate</Label>
          <Input
            placeholder="Ex. 500"
            type="number"
            {...register("presaleRate")}
            name="presaleRate"
          />
          <InputError>{errors.presaleRate?.message}</InputError>
          <InputHint>
            If I spend 1{" "}
            {
              raisedTokenOptions.find(
                (option) => option.value === selectedCurrency
              )?.label
            }
            , how many tokens will I receive?
          </InputHint>
        </InputContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputContainer>
            <Label htmlFor="softCap">Softcap</Label>
            <Input
              placeholder="Soft Cap Ex. 20"
              type="text"
              {...register("softCap")}
              name="softCap"
            />
            <InputError>{errors.softCap?.message}</InputError>
            <InputHint>Softcap must be &gt;= 50% of Hardcap!</InputHint>
          </InputContainer>
          <InputContainer>
            <Label htmlFor="hardCap">Hardcap</Label>
            <Input
              placeholder="Hard Cap Ex. 40"
              type="text"
              {...register("hardCap")}
              name="hardCap"
            />
            <InputError>{errors.hardCap?.message}</InputError>
          </InputContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputContainer>
            <Label htmlFor="minimumLimit">Minimum Buy Limit</Label>
            <Input
              placeholder="Ex. 0.1"
              type="text"
              {...register("minBuy")}
              name="minBuy"
            />
            <InputError>{errors.minBuy?.message}</InputError>
            <InputHint>
              Enter the minimum and maximum amounts each wallet can contribute
            </InputHint>
          </InputContainer>
          <InputContainer>
            <Label htmlFor="maximumLimit">Maximum Buy Limit</Label>
            <Input
              placeholder="Ex. 10"
              type="text"
              {...register("maxBuy")}
              name="maxBuy"
            />
            <InputError>{errors.maxBuy?.message}</InputError>
          </InputContainer>
        </div>

        {/*
        <InputContainer>
          <Label htmlFor="targetExchange">Select Target Exchange</Label>
          <Controller
            control={control}
            name="targetExchange"
            render={({ field: { onChange, value, ref } }) => (
              <AppSelect
                inputRef={ref}
                options={targetDexOptionsList}
                value={targetDexOptionsList.find((c) => c.value === value)}
                onChange={(val) => {
                  setSelectedExchange(val.value);
                  onChange(val.value);
                }}
                placeholder="Select Exchange"
                isSearchable={false}
              />
            )}
          />
          <InputError>{errors.targetExchange?.message}</InputError>
        </InputContainer>
        */}

        {/*
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputContainer>
            <Label htmlFor="liquidityPercent">
              {selectedExchange} Liquidity (%)
            </Label>
            <Input
              placeholder="Ex. 60"
              type="text"
              {...register('liquidityPercent')}
              name="liquidityPercent"
            />
            <InputError>{errors.liquidityPercent?.message}</InputError>
            <InputHint>
              Enter the percentage of raised funds that should be allocated to{' '}
              {selectedExchange}
              Liquidity on (Min 51%, Max 100%)
            </InputHint>
          </InputContainer>
      
          <InputContainer>
            <Label htmlFor="listingRate">Listing Rate</Label>
            <Input
              placeholder="Ex. 400"
              type="text"
              {...register('listingRate')}
              name="listingRate"
            />
            <InputError>{errors.listingRate?.message}</InputError>
            <InputHint>
              If I buy 1 BNB worth on DEX, how many tokens do I get? (Usually this amount is lower
              than presale rate to allow for a higher listing price on DEX)
            </InputHint>
          </InputContainer>*/}
        {/*</div>*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputContainer>
            <Label htmlFor="startDate">Start Date (UTC)</Label>
            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value, ref } }) => (
                <DateTimePicker onChange={onChange} value={value} utc={true} />
              )}
            />
            <InputError>{errors.startDate?.message}</InputError>
          </InputContainer>
          <InputContainer>
            <Label htmlFor="endDate">End Date (UTC)</Label>
            <Controller
              control={control}
              name="endDate"
              render={({ field: { onChange, value, ref } }) => (
                <DateTimePicker onChange={onChange} value={value} utc={true} />
              )}
            />
            <InputError>{errors.endDate?.message}</InputError>
          </InputContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputContainer>
            <Label htmlFor="claimDate">Claim Date (UTC)</Label>
            <Controller
              control={control}
              name="claimDate"
              render={({ field: { onChange, value, ref } }) => (
                <DateTimePicker onChange={onChange} value={value} utc={true} />
              )}
            />
            <InputError>{errors.claimDate?.message}</InputError>
            <InputHint>User should claim token before this date.</InputHint>
          </InputContainer>
          <InputContainer>
            <Label htmlFor="remainingTokenOption">Unsold Tokens</Label>
            <Controller
              control={control}
              name="remainingTokenOption"
              defaultValue={remainingTokenOptions[0]?.value}
              render={({ field: { onChange, value, ref } }) => (
                <AppSelect
                  inputRef={ref}
                  options={remainingTokenOptions}
                  value={remainingTokenOptions.find((c) => c.value === value)}
                  onChange={(val) => {
                    // setTokenOption(val.value);
                    onChange(val.value);
                  }}
                  placeholder="Options for unsold tokens"
                  isSearchable={false}
                />
              )}
            />
            <InputError>{errors.remainingTokenOption?.message}</InputError>
            <InputHint>
              The unsold tokens are either refunded to the launchpad creator or
              being burned after sale finished.
            </InputHint>
          </InputContainer>
        </div>
        {/*
        <InputContainer>
          <Label htmlFor="liquidityLockUp">Liquidity Lockup</Label>
          <Input
            placeholder="Ex. 10"
            type="number"
            {...register('liquidityLockUp')}
            name="liquidityLockUp"
          />
          <InputError>{errors.liquidityLockUp?.message}</InputError>
        </InputContainer>
              */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputContainer>
            <Label htmlFor="tokenPaymentAddr">Currency Token</Label>
            <Controller
              control={control}
              name="tokenPaymentAddr"
              defaultValue={raisedTokenOptions[0]?.value}
              render={({ field: { onChange, value, ref } }) => (
                <AppSelect
                  inputRef={ref}
                  options={raisedTokenOptions}
                  value={raisedTokenOptions.find((c) => c.value === value)}
                  onChange={(val) => {
                    // setTokenOption(val.value);
                    setSelectedCurrency(val.value);
                    onChange(val.value);
                  }}
                  placeholder="Raised Token"
                  isSearchable={false}
                />
              )}
            />
            <InputError>{errors.raisedTokenOptions?.message}</InputError>
          </InputContainer>
          <InputContainer>
            <Label htmlFor="feeOption">Fee Options</Label>
            <Controller
              control={control}
              name="feeOption"
              defaultValue={feeOptions[0]?.value}
              render={({ field: { onChange, value, ref } }) => (
                <AppSelect
                  inputRef={ref}
                  options={feeOptions}
                  value={feeOptions.find((c) => c.value === value)}
                  onChange={(val) => {
                    // setTokenOption(val.value);
                    onChange(val.value);
                  }}
                  placeholder="Fee Options"
                  isSearchable={false}
                />
              )}
            />
            <InputError>{errors.feeOptions?.message}</InputError>
          </InputContainer>
        </div>

        <InputContainer className="flex justify-between">
          <PrimaryButton size="small" type="button" onClick={moveToPrevious}>
            Previous
          </PrimaryButton>
          <PrimaryButton size="small" type="submit">
            Next
          </PrimaryButton>
        </InputContainer>
      </form>
    </Card>
  );
};
