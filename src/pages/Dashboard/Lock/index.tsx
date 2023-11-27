import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import {
  Input,
  Label,
  InputContainer,
  InputError,
  CustomInputHint
} from '../../../components/common/Inputs';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { DateTimePicker } from '../../../components/common/DateTimePicker';
import { successToast } from '../../../components/common/NotificationToast';
import { Badge } from '../../../components/common/Badge';
import { Alert } from '../../../components/common/Alerts';
import { approveTokenLocker, getStandardTokenBalance, isValidAddress, checkTokenAllowance, createTokenLock } from '../../../services/blockchainService'
import { getBNFromToken } from '../../../utils'
import { useNavigate, useParams } from "react-router-dom";


const validationSchema = Yup.object().shape({
  tokenAddress: Yup.string().required('Token address is required'),
  amount: Yup.string().required('Amount of token is required'),
  lockTime: Yup.date()
    .required('Start date is required.')
    .min(new Date(), 'Lock time cannot be in the past'),
});
const formOptions = { resolver: yupResolver(validationSchema) };

const LockToken = () => {
  const { register, handleSubmit, setError, getValues, formState, control } =
    useForm(formOptions);
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isTokenAllowed, setIsTokenAllowed] = useState(false)
  const [totalSupply, setTotalSupply] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimal, setDecimal] = useState(18)
  const [tokenAddr, setTokenAddr] = useState('')
  
  const navigate = useNavigate()

  const handleForm: SubmitHandler<any> = async (value) => {
    if (!tokenAddr) return;
    setIsLoading(true)
    const receipt = await createTokenLock([tokenAddr, false, getBNFromToken(getValues('amount'), decimal), getValues('lockTime').unix()])
    // Send http request with form data
    // successToast({ message: 'The form was created successfully' });
    setIsLoading(false)
    if (receipt) {
      let address = receipt.events[0].address;
      const { isConfirmed } = await Alert({
        title: 'Token Locked Successfully',
        iconHtml: '<i class="las la-lock"></i>',
        iconColor: '#00BA38',
      });
      if (isConfirmed) {
        navigate(`/app/token-lockers/${address}`)
        return;
      }
    }

  };

  const handleApprove = async () => {
    const tokenAddr = getValues('tokenAddress')
    if (tokenAddr) {
      setIsLoading(true)
      let receipt = await approveTokenLocker(
        tokenAddr,
      );
      console.log(receipt);
      if (receipt) {
        setIsTokenAllowed(true)
        setTokenAddr(tokenAddr)
      }
      setIsLoading(false)
    }
  };

  const handleGetTokenBalance = async (address: string) => {
    const isValid = isValidAddress(address)
    if (isValid) {
      setIsLoading(true)
      const res = await getStandardTokenBalance(address)
      console.log({ res })
      setDecimal(res?.decimals || 18)
      setTotalSupply(res?.calc_totalSupply || '')
      setName(res?.tname || '')
      setSymbol(res?.tsymbol || '')
      setError('tokenAddress', { type: 'custom', message: '' })
      const isAllowed = await checkTokenAllowance(address, 'LOCKER')
      setIsTokenAllowed(!!isAllowed)
      if (isAllowed) {
        setTokenAddr(address)
      }
      setIsLoading(false)
      setIsError(false)

    }
    else {
      setError('tokenAddress', { type: 'custom', message: 'Invalid token address' })
      setIsError(true)
      setTokenAddr('')
    }
  }

  return (
    <div>
      <div className="text-center font-bold text-2xl py-10">
        <h3>Token Locker</h3>
      </div>
      <div className="max-w-xl mx-auto">
        <Card>
          <form className="mt-5" onSubmit={handleSubmit(handleForm)}>
            <InputContainer>
              <Label htmlFor="tokenAddress">Token Address</Label>
              <Input
                type="text"
                placeholder="Ex. 0x81507617417b71fC2d231F187bE4Bd919e572761"
                {...register('tokenAddress')}
                name="tokenAddress"
                onChange={event => handleGetTokenBalance(event.target.value)}
              />
              <InputError>{errors.tokenAddress?.message}</InputError>
              {!isError && <div>
                <CustomInputHint>Token Name: {name}</CustomInputHint>
                <CustomInputHint>Total Supply: {totalSupply}</CustomInputHint>
                <CustomInputHint>Symbol: {symbol}</CustomInputHint>
              </div>}
            </InputContainer>
            <InputContainer>
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="text"
                placeholder="Ex. 1000"
                {...register('amount')}
                name="amount"
              />
              <InputError>{errors.amount?.message}</InputError>
            </InputContainer>
            <InputContainer>
              <Label htmlFor="lockTime">Lock Time (UTC)</Label>
              <Controller
                control={control}
                name="lockTime"
                render={({ field: { onChange, value, ref } }) => (
                  <DateTimePicker
                    onChange={onChange}
                    value={value}
                    utc={true}
                    inputProps={{ placeholder: 'Select Date' }}
                  />
                )}
              />
              <InputError>{errors.lockTime?.message}</InputError>
            </InputContainer>
            <InputContainer className="text-center">
              {isTokenAllowed ? <PrimaryButton disabled={isLoading} type="submit">Lock Token</PrimaryButton> : <PrimaryButton disabled={isLoading} type="button" onClick={handleApprove}>Approve Token</PrimaryButton>}
            </InputContainer>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LockToken;
